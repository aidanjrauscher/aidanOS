const ALLOWED_ORIGINS = ['https://aidanjrauscher.com', 'https://www.aidanjrauscher.com', 'http://127.0.0.1:3000', 'http://localhost:3000'];

async function getStoredRefreshToken() {
  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  try {
    const res = await fetch(`${KV_REST_API_URL}/get/spotify_refresh_token`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    });
    const { result } = await res.json();
    return result || null;
  } catch {
    return null;
  }
}

async function storeRefreshToken(token) {
  const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return;
  try {
    await fetch(`${KV_REST_API_URL}/set/spotify_refresh_token/${encodeURIComponent(token)}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    });
  } catch {
    // ignore — stale token will still work until next rotation
  }
}

async function exchangeRefreshToken(refreshToken, credentials) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  return response.json();
}

export default async function handler(req, res) {
  // Block requests with a foreign Origin header (same-origin requests won't have one)
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin && !ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  // Try KV-stored token first, fall back to env var
  const storedToken = await getStoredRefreshToken();
  let refreshToken = storedToken || SPOTIFY_REFRESH_TOKEN;

  let data = await exchangeRefreshToken(refreshToken, credentials);

  // If stored token failed, retry with env var
  if (!data.access_token && storedToken && SPOTIFY_REFRESH_TOKEN !== storedToken) {
    data = await exchangeRefreshToken(SPOTIFY_REFRESH_TOKEN, credentials);
    if (data.access_token) {
      // Env var token worked — clear the bad stored token so we use env var next time
      await storeRefreshToken(SPOTIFY_REFRESH_TOKEN);
    }
  }

  if (!data.access_token) {
    return res.status(500).json({ error: 'Failed to get token' });
  }

  // Persist rotated refresh token if Spotify returned a new one
  if (data.refresh_token && data.refresh_token !== refreshToken) {
    await storeRefreshToken(data.refresh_token);
  }

  res.status(200).json({ access_token: data.access_token });
}
