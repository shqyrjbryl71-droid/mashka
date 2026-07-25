import { getStore } from '@netlify/blobs';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '014842';
const KEY = 'site-data';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export default async (req) => {
  const store = getStore('mishkat-content');

  if (req.method === 'GET') {
    try {
      const data = await store.get(KEY, { type: 'json' });
      return json(data || null);
    } catch (error) {
      return json(null);
    }
  }

  if (req.method === 'PUT') {
    const secret = req.headers.get('x-admin-secret');
    if (!secret || secret !== ADMIN_SECRET) {
      return json({ error: 'unauthorized' }, 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return json({ error: 'invalid json' }, 400);
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ error: 'invalid data' }, 400);
    }

    try {
      await store.setJSON(KEY, body);
      return json({ ok: true });
    } catch (error) {
      return json({ error: 'save failed' }, 500);
    }
  }

  return json({ error: 'method not allowed' }, 405);
};
