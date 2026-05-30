import { getToken } from './spotify';

let player = null;
let deviceId = null;

export async function initPlayer() {
  if (deviceId) return;

  await new Promise((resolve, reject) => {
    const setup = () => {
      player = new window.Spotify.Player({
        name: 'AidanOS',
        getOAuthToken: cb => getToken().then(token => { console.log('SDK token:', token); cb(token); }),
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }) => {
        deviceId = device_id;
        resolve();
      });

      player.addListener('initialization_error', ({ message }) => reject(new Error('init: ' + message)));
      player.addListener('authentication_error', ({ message }) => reject(new Error('auth: ' + message)));
      player.addListener('account_error', ({ message }) => reject(new Error('account: ' + message)));

      player.connect();
    };

    if (window.Spotify) {
      setup();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setup;
    }
  });
}

export async function stopPlayback() {
  if (player) player.pause();
}

export async function playTrack(uri) {
  await initPlayer();
  const token = await getToken();

  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [uri] }),
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`${res.status}: ${err?.error?.message || 'unknown'}`);
  }
}
