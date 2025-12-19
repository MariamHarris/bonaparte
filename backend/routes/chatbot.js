const express = require('express');
const { recordInteraction, getVacancyById } = require('../storage/mysql-repo');

const router = express.Router();

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
  if (/\b(empresa|publica|privada|organizacion|registro)\b/.test(t)) return 'companies';
  if (/\b(factura|facturacion|dgi|peaje|costo|cobro|tarifa)\b/.test(t)) return 'billing';
  if (/\b(contacto|telefono|correo|email|soporte)\b/.test(t)) return 'contact';

  return 'fallback';
}

function buildAnswer(intent) {
  switch (intent) {
    case 'empty':
      return {
        text:
          'Escribe tu pregunta. Por ejemplo: "¿Cómo veo las vacantes?" o "¿Qué es el peaje?"',
        suggestions: ['Ver vacantes', 'Qué es el peaje', 'Ayuda'],
      };

    case 'greeting':
      return {
        text:
          'Hola. Soy el asistente del prototipo Bonaparte. Puedo ayudarte a encontrar vacantes y aclarar cómo funciona el peaje y la facturación.',
        suggestions: ['Ver vacantes', 'Qué es el peaje', 'Ayuda'],
      };

    case 'help':
      return {
        text:
          'Opciones rápidas: (1) consultar vacantes, (2) entender el peaje por interacciones, (3) saber cómo se factura, (4) registro de empresas (públicas/privadas).',
        suggestions: ['Vacantes', 'Peaje', 'Facturación', 'Empresas'],
      };

    case 'vacancies':
      return {
        text:
          'Para ver vacantes, usa el listado público. Cada vez que abres una vacante se registra una interacción (acceso) para estadísticas y facturación por peaje.',
        suggestions: ['Cómo se registra una interacción', 'Qué es el peaje', 'Facturación'],
      };

    case 'companies':
      return {
        text:
          'Las empresas (públicas o privadas) se registran con usuario y contraseña. Luego pueden crear y administrar vacantes. La consultora gestiona el peaje y la facturación.',
        suggestions: ['Registro empresa', 'Contrato digital', 'Peaje'],
      };

    case 'billing':
      return {
        text:
          'El “peaje” es un costo por interacción (acceso a una vacante). Con base en las estadísticas de interacciones se genera una factura emulada tipo DGI, accesible por un enlace web.',
        suggestions: ['Cómo se calcula', 'Ver estadísticas', 'Factura emulada'],
      };

    case 'contact':
      return {
        text:
          'Para soporte del prototipo, contacta a la Empresa Consultores Chiriquí, S.A. (según el equipo del proyecto). Si me dices tu duda, puedo orientarte aquí mismo.',
        suggestions: ['Ayuda', 'Vacantes', 'Facturación'],
      };

    default:
      return {
        text:
          'Puedo ayudarte con vacantes, empresas, peaje/interacciones y facturación. ¿Tu pregunta es sobre vacantes o sobre el costo/peaje?',
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
    const answer = buildAnswer(intent);

    let linkedVacancy = null;
    if (vacancyId) {
      linkedVacancy = await getVacancyById(String(vacancyId));
      if (linkedVacancy) {
        await recordInteraction({ vacancyId: linkedVacancy.id, channel: 'chatbot', event: 'chat' });
      }
    }

    res.json({
      ok: true,
      intent,
      answer,
      linkedVacancy: linkedVacancy ? { id: linkedVacancy.id, title: linkedVacancy.title } : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
