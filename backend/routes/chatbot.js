const express = require('express');
const { recordInteraction, getVacancyById, getVacancyInteractionStats } = require('../storage/mysql-repo');

const router = express.Router();

const PY_ANALYTICS_URL = process.env.PY_ANALYTICS_URL;
const PY_ANALYTICS_TOKEN = process.env.PY_ANALYTICS_TOKEN || process.env.ANALYTICS_TOKEN;

async function callPythonChat(payload) {
  if (!PY_ANALYTICS_URL) return null;
  const headers = { 'Content-Type': 'application/json' };
  if (PY_ANALYTICS_TOKEN) headers['x-api-key'] = PY_ANALYTICS_TOKEN;

  const res = await fetch(`${PY_ANALYTICS_URL}/chatbot/ask`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Python chatbot error HTTP ${res.status}`);
  }
  return res.json();
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
  if (/\b(vacante|vacantes|empleo|trabajo|oferta)\b/.test(t)) return 'vacancies';
  if (/\b(empresa|publica|privada|organizacion|registro|ruc|dv)\b/.test(t)) return 'companies';
  if (/\b(factura|facturacion|dgi|peaje|costo|cobro|tarifa|itbms)\b/.test(t)) return 'billing';
  if (/\b(interaccion|interacciones|conteo|estadistica|peaje)\b/.test(t)) return 'interactions';
  if (/\b(provincia|panama|chiriqui|veraguas|colon|dari[eé]n|bocas|cocle|herrera|santos)\b/.test(t)) return 'panama';
  if (/\b(contacto|telefono|correo|email|soporte)\b/.test(t)) return 'contact';

  return 'fallback';
}

function buildAnswer(intent) {
  switch (intent) {
    case 'empty':
      return {
        text:
          'Escribe tu pregunta. Ejemplos: "¿Cómo veo las vacantes?", "¿Qué es el peaje?", "¿Cómo se factura el ITBMS?"',
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
          'Opciones rápidas: (1) vacantes públicas/privadas, (2) peaje por interacción (accesos/chat), (3) facturación con ITBMS simulado, (4) registro de empresas en Panamá.',
        suggestions: ['Vacantes', 'Peaje', 'Facturación', 'Registro empresa'],
      };

    case 'vacancies':
      return {
        text:
          'Para ver vacantes usa el portal público (sin registro). Abrir o detallar una vacante registra una interacción que alimenta el peaje que cobra la Empresa Consultora.',
        suggestions: ['Cómo se registra una interacción', 'Ver provincias', 'Qué es el peaje'],
      };

    case 'companies':
      return {
        text:
          'Empresas públicas y privadas se registran con usuario/contraseña. Guardan RUC/DV simulados y provincia/distrito panameños. La consultora cobra peaje por la visibilidad de sus vacantes.',
        suggestions: ['Contrato digital', 'Empresas públicas vs privadas', 'Peaje'],
      };

    case 'billing':
      return {
        text:
          'El peaje es un costo por interacción (acceso, detalle o chat). Se emite factura emulada tipo DGI con ITBMS 7%. El HTML queda accesible por enlace público.',
        suggestions: ['Cómo se calcula', 'ITBMS 7%', 'Ver estadísticas'],
      };

    case 'interactions':
      return {
        text:
          'Cada apertura de vacante, detalle o chat registra una interacción. Estas se cuentan por empresa/vacante para calcular el peaje y la factura simulada. Se pueden consultar en /api/stats.',
        suggestions: ['Cómo ver estadísticas', 'Peaje', 'Facturación'],
      };

    case 'panama':
      return {
        text:
          'El prototipo usa provincias reales de Panamá (Panamá, Panamá Oeste, Chiriquí, Veraguas, Coclé, Herrera, Los Santos, Colón, Darién, Bocas del Toro). Cada vacante muestra provincia; si falta, se indica “Panamá (simulado)”.',
        suggestions: ['Ver vacantes', 'Empresas públicas/privadas', 'Peaje'],
      };

    case 'contact':
      return {
        text:
          'Soporte del prototipo: Empresa Consultora (simulada). Indica tu duda y te ayudo aquí mismo. Acceso público no requiere registro.',
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

    if (PY_ANALYTICS_URL) {
      try {
        const pyAnswer = await callPythonChat({ message, vacancyId });
        if (pyAnswer && pyAnswer.answer) {
          answer = { text: pyAnswer.answer, suggestions: pyAnswer.suggestions || [] };
          intentUsed = pyAnswer.intent || intent;
        }
      } catch (err) {
        console.warn('Chatbot Python fallback usado:', err.message);
      }
    }
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // ventana 30 días para estadísticas de apoyo

    let linkedVacancy = null;
    let vacancyStats = null;
    if (vacancyId) {
      linkedVacancy = await getVacancyById(String(vacancyId));
      if (linkedVacancy) {
        await recordInteraction({ vacancyId: linkedVacancy.id, channel: 'chatbot', event: 'chat' });
        vacancyStats = await getVacancyInteractionStats({ vacancyId: linkedVacancy.id, start, end });
      }
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
