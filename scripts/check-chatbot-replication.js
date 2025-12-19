/* eslint-disable no-console */

async function login(base) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'consultora_demo', password: 'demo123' }),
  });
  if (!res.ok) throw new Error(`login failed HTTP ${res.status}`);
  return res.json();
}

(async () => {
  const base = process.env.BONAPARTE_API_BASE || 'http://127.0.0.1:3001';
  const { token } = await login(base);

  const res = await fetch(`${base}/api/replication/chatbot?limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  console.log('HTTP', res.status);
  console.log(JSON.stringify(data, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
