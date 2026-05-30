const PLAYLIST_ID = '07ZVoMh7POKkPdIyh8mM4v';

export async function getToken() {
  const res = await fetch('/api/spotify-token');
  const { access_token } = await res.json();
  return access_token;
}

export async function getRandomTrackFromPlaylist() {
  const token = await getToken();

  // Fetch total count first
  const countRes = await fetch(
    `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/items?limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const { total } = await countRes.json();

  const offset = Math.floor(Math.random() * total);
  const trackRes = await fetch(
    `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/items?limit=1&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await trackRes.json();
  return data.items?.[0]?.item ?? null;
}
