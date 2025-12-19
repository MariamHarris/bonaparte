const express = require('express');
const { recordInteraction, getVacancyById, getVacancyInteractionStats } = require('../storage/mysql-repo');

const router = express.Router();

const PY_ANALYTICS_URL = process.env.PY_ANALYTICS_URL;
const PY_ANALYTICS_TOKEN = process.env.PY_ANALYTICS_TOKEN || process.env.ANALYTICS_TOKEN;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL; // p. ej. "phi3:mini" o "llama3:8b"
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 7000);
const PY_CHATBOT_TIMEOUT_MS = Number(process.env.PY_CHATBOT_TIMEOUT_MS || 4000);

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callPythonChat(payload) {
  if (!PY_ANALYTICS_URL) return null;
  const headers = { 'Content-Type': 'application/json' };
  if (PY_ANALYTICS_TOKEN) headers['x-api-key'] = PY_ANALYTICS_TOKEN;

  const res = await fetchWithTimeout(
    `${PY_ANALYTICS_URL}/chatbot/ask`,
    {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    },
    PY_CHATBOT_TIMEOUT_MS,
  );

  if (!res.ok) {
    throw new Error(`Python chatbot error HTTP ${res.status}`);
  }
  return res.json();
}

async function callOllamaChat({ message, vacancyId }) {
  if (!OLLAMA_MODEL) return null;
  const prompt = `Eres un asistente para Bonaparte, un portal de vacantes (demo) en Panama.

Reglas:
- Responde en espanol, 2-4 frases max.
- No uses codigo, no muestres JSON, no des detalles tecnicos.
- En Bonaparte, "peaje" NO es de carretera: es un costo por interaccion con vacantes (acceso, ver detalle o chat).
- Si preguntan por facturacion: menciona ITBMS 7% y factura HTML emulada tipo DGI.
- Si no sabes, pide una aclaracion con una pregunta.

Hechos del producto (no contradigas esto):
- SI existe peaje por interaccion.
- Una interaccion es: abrir vacante, ver detalle o usar chatbot.
- El peaje es un monto por interaccion (ej. USD 0.25 por defecto).
- La facturacion es emulada: subtotal (interacciones x peaje) + ITBMS 7% + total.
- Se genera una factura HTML accesible por enlace.

Formato de respuesta:
- Explica en palabras simples.
- Si hablan de ITBMS, deja claro que es un impuesto del 7% sobre el subtotal (no es el costo).
- No hagas preguntas de "preferencia" al final; cierra con una frase de ayuda como "¿Quieres ver vacantes o saber cómo se calcula?".

Contexto:
- vacancyId: ${vacancyId || 'none'}

Usuario: ${message || ''}`;
  const res = await fetchWithTimeout(
    `${OLLAMA_URL.replace(/\/$/, '')}/api/generate`,
    {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.4 },
    }),
    },
    OLLAMA_TIMEOUT_MS,
  );

  if (!res.ok) throw new Error(`Ollama error HTTP ${res.status}`);
  const data = await res.json();
  const text = (data && data.response) || '';
  return {
    answer: text.trim().replace(/^"|"$/g, ''),
    intent: 'ollama',
    suggestions: ['Vacantes', 'Peaje', 'Facturacion'],
  };
}

function cleanAssistantText(raw) {
  let text = String(raw || '');

  // Remove code blocks and backticks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`+/g, '');

  // Normalize whitespace and unicode
  text = text.replace(/\r\n?/g, '\n');
  text = text.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, ' ');
  // Replace Unicode replacement char (often appears when encoding breaks)
  text = text.replace(/\uFFFD/g, '');
  try {
    text = text.normalize('NFC');
  } catch {
    // ignore
  }
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.trim();

  // Remove common awkward endings
  text = text.replace(/\s*¿?cu[aá]l es tu preferencia\??\s*/gi, ' ');
  text = text.replace(/\s*si desea saber m[aá]s[\s\S]*$/i, '');
  text = text.replace(/\s*si quieres saber m[aá]s[\s\S]*$/i, '');
  text = text.trim();

  // Limit to 2–4 sentences max
  const parts = text
    .split(/(?<=[.!?¿])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length > 4) text = parts.slice(0, 4).join(' ');

  // Hard cap length
  if (text.length > 520) text = `${text.slice(0, 520).trim()}…`;

  // Ensure it ends cleanly
  if (text && !/[.!?…]$/.test(text)) text += '.';

  // If too short or empty, provide a safe fallback
  if (!text || text.length < 5) {
    return 'Puedo ayudarte con vacantes, peaje por interacción y facturación. ¿Qué quieres saber?';
  }

  return text;
}

function isBillingQuestion(message, intent) {
  const t = normalizeText(message);
  if (intent === 'billing' || intent === 'interactions') return true;
  return /\b(factura|facturacion|itbms|dgi|peaje|costo|tarifa|cobro|total|subtotal|impuesto)\b/.test(t);
}

function enforceBonaparteFacts({ message, intent, assistantText }) {
  if (!isBillingQuestion(message, intent)) return assistantText;

  // Deterministic, always-correct explanation for billing topics.
  return (
    'En Bonaparte, el peaje es un costo por interacción con vacantes (abrir una vacante, ver el detalle o usar el chatbot). ' +
    'Por defecto es USD 0.25 por interacción. ' +
    'La factura se calcula así: subtotal = interacciones × peaje; ITBMS = 7% del subtotal; total = subtotal + ITBMS. ' +
    'La factura se genera en HTML y queda disponible por enlace.'
  );
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function detectIntent(message) {
  const t = normalizeText(message);

  if (!t) return 'empty';
  if (/\b(hola|buenas|hey|saludos)\b/.test(t)) return 'greeting';
  if (/\b(ayuda|help|que puedo hacer|menu|opciones)\b/.test(t)) return 'help';

  // Off-topic: responde amable y redirige al contexto de la app.
  // (Evita que un LLM recomiende peliculas, astrologia, etc.)
  if (/\b(pelicula|peliculas|movie|netflix|serie|series|signo|zodiaco|zodiacal|horoscopo|astrolog)\b/.test(t)) {
    return 'offtopic';
  }

  if (/\b(vacante|vacantes|empleo|trabajo|oferta)\b/.test(t)) return 'vacancies';
  if (/\b(empresa|publica|privada|organizacion|registro|ruc|dv)\b/.test(t)) return 'companies';
  if (/\b(factura|facturacion|dgi|peaje|costo|cobro|tarifa|itbms)\b/.test(t)) return 'billing';
  if (/\b(interaccion|interacciones|conteo|estadistica|peaje)\b/.test(t)) return 'interactions';
  if (/\b(replicacion|replica|primary|primario|secundario|read[- ]?only|lag|proxysql|haproxy)\b/.test(t)) return 'replication';
  if (/\b(provincia|panama|chiriqui|veraguas|colon|dari[eé]n|bocas|cocle|herrera|santos)\b/.test(t)) return 'panama';
  if (/\b(contacto|telefono|correo|email|soporte)\b/.test(t)) return 'contact';

  return 'fallback';
}

function buildAnswer(intent) {
  switch (intent) {
    case 'empty':
      return {
        text:
          'Cuéntame qué necesitas. Ejemplos: "¿Cómo veo las vacantes?", "¿Qué es el peaje?", "¿Cómo se factura el ITBMS?"',
        suggestions: ['Ver vacantes', 'Qué es el peaje', 'Ayuda'],
      };

    case 'greeting':
      return {
        text:
          'Hola. Soy el asistente del prototipo Bonaparte (Panamá). Puedo orientarte sobre vacantes, peaje por interacción y facturación emulada (tipo DGI).',
        suggestions: ['Ver vacantes', 'Qué es el peaje', 'Empresas públicas/privadas'],
      };

    case 'help':
      return {
        text:
          'Puedo ayudarte con: vacantes, peaje por interacción (accesos/chat), facturación con ITBMS 7% emulada y registro de empresas públicas/privadas.',
        suggestions: ['Vacantes', 'Peaje', 'Facturación', 'Registro empresa'],
      };

    case 'offtopic':
      return {
        text:
          'Puedo ayudarte con cosas relacionadas a Bonaparte (vacantes, peaje por interacción, estadísticas y facturación). Para mantener el contexto del sistema, no respondo recomendaciones de películas ni temas como el signo zodiacal. ¿Quieres ver vacantes o cómo se calcula el peaje?',
        suggestions: ['Ver vacantes', 'Qué es el peaje', 'Ver estadísticas', 'Ayuda'],
      };

    case 'vacancies':
      return {
        text:
          'Las vacantes son públicas. Cada vez que abres o ves el detalle contamos una interacción que suma al peaje que cobra la consultora.',
        suggestions: ['Cómo se registra una interacción', 'Ver provincias', 'Qué es el peaje'],
      };

    case 'companies':
      return {
        text:
          'Las empresas (pública o privada) se registran con usuario/contraseña y guardan RUC/DV simulados y provincia/distrito de Panamá. La consultora cobra peaje por la visibilidad de sus vacantes.',
        suggestions: ['Contrato digital', 'Empresas públicas vs privadas', 'Peaje'],
      };

    case 'billing':
      return {
        text:
          'El peaje es un costo por interacción (acceso, detalle o chat). Generamos una factura HTML emulada tipo DGI con ITBMS 7% y queda disponible por enlace público.',
        suggestions: ['Cómo se calcula', 'ITBMS 7%', 'Ver estadísticas'],
      };

    case 'interactions':
      return {
        text:
          'Cada apertura de vacante, detalle o chat registra una interacción. Las contamos por empresa y vacante para calcular el peaje y la factura emulada. Puedes ver estadísticas en el panel.',
        suggestions: ['Cómo ver estadísticas', 'Peaje', 'Facturación'],
      };

    case 'replication':
      return {
        text:
          'La replicación muestra el estado entre MySQL primario y réplica (por ejemplo: readOnly, IO/SQL running y lag). En el panel de consultora puedes abrir “Replicación (vivo)” para ver el estado y comparar datos.',
        suggestions: ['Ver replicación (vivo)', 'Empresas', 'Ver estadísticas'],
      };

    case 'panama':
      return {
        text:
          'Usamos provincias reales de Panamá (Panamá, Panamá Oeste, Chiriquí, Veraguas, Coclé, Herrera, Los Santos, Colón, Darién, Bocas del Toro). Si falta provincia, mostramos “Panamá (simulado)”.',
        suggestions: ['Ver vacantes', 'Empresas públicas/privadas', 'Peaje'],
      };

    case 'contact':
      return {
        text:
          'Soy el asistente del prototipo. Déjame tu duda y te respondo aquí mismo. El acceso público no requiere registro.',
        suggestions: ['Ayuda', 'Vacantes', 'Facturación'],
      };

    default:
      return {
        text:
          'Puedo ayudarte con vacantes, empresas (públicas/privadas), peaje por interacción y facturación emulada en Panamá. ¿Te interesa vacantes o cómo se cobra el peaje?',
        suggestions: ['Vacantes', 'Peaje', 'Facturación', 'Ayuda'],
      };
  }
}

// Chatbot público (sin login). Opcionalmente recibe vacancyId para asociar la conversación
// y registrar interacción en la BD (channel=chatbot, event=chat).
router.post('/ask', async (req, res, next) => {
  try {
    const { message, vacancyId } = req.body || {};
    const intent = detectIntent(message);
    let answer = buildAnswer(intent);
    let intentUsed = intent;

    // Optimización: para peaje/facturación/interacciones usamos respuesta determinística
    // (evita esperas largas en LLM/Python y evita alucinaciones).
    const skipExternalAi = intent === 'billing' || intent === 'interactions' || intent === 'offtopic';

    // Si hay vacancyId, empezamos a buscar la vacante en paralelo.
    const linkedVacancyPromise = vacancyId ? getVacancyById(String(vacancyId)) : Promise.resolve(null);

    if (!skipExternalAi && OLLAMA_MODEL) {
      try {
        const llm = await callOllamaChat({ message, vacancyId });
        if (llm && llm.answer) {
          answer = { text: llm.answer, suggestions: llm.suggestions || [] };
          intentUsed = llm.intent || intent;
        }
      } catch (err) {
        const msg = err && err.name === 'AbortError' ? 'timeout' : err.message;
        console.warn('Chatbot Ollama fallback usado:', msg);
      }
    }

    // Importante: no llamar a Python si ya respondió Ollama.
    const gotFromOllama = intentUsed === 'ollama';
    if (!skipExternalAi && !gotFromOllama && PY_ANALYTICS_URL) {
      try {
        const pyAnswer = await callPythonChat({ message, vacancyId });
        if (pyAnswer && pyAnswer.answer) {
          answer = { text: pyAnswer.answer, suggestions: pyAnswer.suggestions || [] };
          intentUsed = pyAnswer.intent || intent;
        }
      } catch (err) {
        const msg = err && err.name === 'AbortError' ? 'timeout' : err.message;
        console.warn('Chatbot Python fallback usado:', msg);
      }
    }

    // Final polish: always return friendly, short, readable text
    answer = {
      ...answer,
      text: cleanAssistantText(
        enforceBonaparteFacts({ message, intent, assistantText: answer && answer.text }),
      ),
    };
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // ventana 30 días para estadísticas de apoyo

    let linkedVacancy = null;
    let vacancyStats = null;
    linkedVacancy = await linkedVacancyPromise;
    if (linkedVacancy) {
      await recordInteraction({
        vacancyId: linkedVacancy.id,
        channel: 'chatbot',
        event: 'chat',
        intent: intentUsed,
        userMessage: message,
        assistantMessage: answer && answer.text,
      });
      vacancyStats = await getVacancyInteractionStats({ vacancyId: linkedVacancy.id, start, end });
    }

    res.json({
      ok: true,
      intent: intentUsed,
      answer,
      linkedVacancy: linkedVacancy ? { id: linkedVacancy.id, title: linkedVacancy.title } : null,
      stats: vacancyStats
        ? {
            window: { start: start.toISOString(), end: end.toISOString() },
            totalInteractions: vacancyStats.total,
            byChannel: vacancyStats.byChannel,
            byEvent: vacancyStats.byEvent,
          }
        : null,
      note:
        vacancyStats
          ? 'Interacción registrada y contabilizada para peaje. Estadística de la vacante incluida en la respuesta.'
          : 'Interacción registrada (si hay vacante) para peaje y futura facturación emulada.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
