/* eslint-disable no-console */

async function ask(base, message) {
  const res = await fetch(`${base}/api/chatbot/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, vacancyId: null }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

(async () => {
  const base = process.env.BONAPARTE_API_BASE || 'http://127.0.0.1:3001';
  const questions = [
    'recomiendame una pelicula',
    'cual es mi signo zodiacal?',
    'quiero ver replicacion',
    'como se calcula el peaje?',
  ];

  for (const q of questions) {
    const { status, data } = await ask(base, q);
    const text = data && data.answer && data.answer.text ? data.answer.text : '';
    console.log('\nQ:', q);
    console.log('HTTP:', status);
    console.log('intent:', data.intent);
    console.log('text:', text.slice(0, 220));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
