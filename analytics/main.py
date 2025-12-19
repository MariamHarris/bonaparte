import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Bonaparte Analytics", version="0.1.0")

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3307"))
MYSQL_USER = os.getenv("MYSQL_USER", "bonaparte")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "yourpassword")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "bonaparte")
INTERNAL_TOKEN = os.getenv("ANALYTICS_TOKEN", "")

DATABASE_URL = (
    f"mysql+asyncmy://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)

def get_engine() -> AsyncEngine:
    return create_async_engine(DATABASE_URL, pool_pre_ping=True, future=True)

engine = get_engine()

class ChatRequest(BaseModel):
    message: str
    vacancyId: Optional[str] = None

class ChatResponse(BaseModel):
    ok: bool
    intent: str
    answer: str
    suggestions: list[str]

class AnalyticsSummary(BaseModel):
    window: dict
    totals: dict
    byChannel: list[dict]
    byProvince: list[dict]
    byIntent: list[dict]
    daily: list[dict]

def require_token(x_api_key: Optional[str] = Header(default=None)):
    if INTERNAL_TOKEN and x_api_key != INTERNAL_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid analytics token")
    return True

@app.get("/health")
async def health():
    return {"ok": True, "service": "analytics", "mysql": bool(engine)}

@app.post("/chatbot/ask", response_model=ChatResponse, dependencies=[Depends(require_token)])
async def chatbot(request: ChatRequest):
    message = (request.message or "").strip()
    if not message:
        return ChatResponse(ok=True, intent="empty", answer="Escribe tu pregunta", suggestions=["Vacantes", "Peaje", "Facturación"])

    lower = message.lower()
    intent = "general"
    if any(k in lower for k in ["vacante", "empleo", "trabajo"]):
        intent = "vacancies"
    elif any(k in lower for k in ["peaje", "costo", "tarifa", "cobro"]):
        intent = "toll"
    elif any(k in lower for k in ["factura", "dgi", "itbms", "billing"]):
        intent = "billing"
    elif any(k in lower for k in ["panama", "provincia", "chiriqui", "colon", "veraguas"]):
        intent = "panama"

    canned = {
        "vacancies": "Puedes ver vacantes públicas y privadas sin registro. Cada apertura/consulta genera una interacción que alimenta el peaje.",
        "toll": "El peaje es un costo por interacción (visita, detalle, chat). Se acumula por empresa/vacante y se factura con ITBMS simulado (7%).",
        "billing": "La consultora genera facturas HTML emulando DGI. Incluyen subtotal, ITBMS 7% y total. Cada factura queda disponible por URL pública.",
        "panama": "El prototipo usa provincias de Panamá y guarda RUC/DV simulados. Las vacantes se etiquetan por provincia para segmentar estadísticas.",
        "general": "Soy el servicio Python de apoyo. Puedo resumir peaje, facturación e interacciones. Pide vacantes, peaje o facturación.",
    }
    suggestions = ["Ver vacantes", "Peaje", "Facturación"]
    answer = canned.get(intent, canned["general"])
    return ChatResponse(ok=True, intent=intent, answer=answer, suggestions=suggestions)

@app.get("/analytics/summary", response_model=AnalyticsSummary, dependencies=[Depends(require_token)])
async def analytics_summary(start: Optional[str] = None, end: Optional[str] = None):
    end_dt = datetime.fromisoformat(end) if end else datetime.utcnow()
    start_dt = datetime.fromisoformat(start) if start else end_dt - timedelta(days=30)

    async with engine.connect() as conn:
        # Totals
        total_q = text(
            """
            SELECT COUNT(*) AS total FROM interactions
            WHERE created_at BETWEEN :start AND :end
            """
        )
        total_res = await conn.execute(total_q, {"start": start_dt, "end": end_dt})
        totals = {"interactions": int(total_res.scalar_one())}

        # By channel
        channel_q = text(
            """
            SELECT COALESCE(channel, 'unknown') AS channel, COUNT(*) AS total
            FROM interactions
            WHERE created_at BETWEEN :start AND :end
            GROUP BY channel
            ORDER BY total DESC
            """
        )
        channel_rows = (await conn.execute(channel_q, {"start": start_dt, "end": end_dt})).mappings().all()
        by_channel = [{"label": row["channel"], "total": int(row["total"])} for row in channel_rows]

        # By province (via company province, falling back to 'Desconocida')
        province_q = text(
            """
            SELECT COALESCE(c.province, 'Desconocida') AS province, COUNT(*) AS total
            FROM interactions i
            LEFT JOIN vacancies v ON v.id = i.vacancy_id
            LEFT JOIN companies c ON c.id = COALESCE(i.company_id, v.company_id)
            WHERE i.created_at BETWEEN :start AND :end
            GROUP BY province
            ORDER BY total DESC
            LIMIT 10
            """
        )
        province_rows = (await conn.execute(province_q, {"start": start_dt, "end": end_dt})).mappings().all()
        by_province = [{"label": row["province"], "total": int(row["total"])} for row in province_rows]

        # Daily series
        daily_q = text(
            """
            SELECT DATE(i.created_at) AS day, COUNT(*) AS total
            FROM interactions i
            WHERE i.created_at BETWEEN :start AND :end
            GROUP BY day
            ORDER BY day
            """
        )
        daily_rows = (await conn.execute(daily_q, {"start": start_dt, "end": end_dt})).mappings().all()
        daily = [
            {"day": row["day"].isoformat(), "total": int(row["total"])}
            for row in daily_rows
            if row["day"] is not None
        ]

        # By intent (chatbot)
        intent_q = text(
            """
            SELECT COALESCE(intent, 'unknown') AS intent, COUNT(*) AS total
            FROM interactions
            WHERE created_at BETWEEN :start AND :end
              AND intent IS NOT NULL
            GROUP BY intent
            ORDER BY total DESC
            LIMIT 10
            """
        )
        intent_rows = (await conn.execute(intent_q, {"start": start_dt, "end": end_dt})).mappings().all()
        by_intent = [{"label": row["intent"], "total": int(row["total"])} for row in intent_rows]

    return AnalyticsSummary(
        window={"start": start_dt.isoformat(), "end": end_dt.isoformat()},
        totals=totals,
        byChannel=by_channel,
        byProvince=by_province,
        byIntent=by_intent,
        daily=daily,
    )

