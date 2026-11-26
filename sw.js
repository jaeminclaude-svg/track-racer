// 인터넷이 되면 항상 새 게임을 받고, 안 되면 저장해 둔 것으로 실행해요.
const CACHE = 'trackracer-v1';
const THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map(u => c.add(u).catch(() => {})));
    try { await c.add(new Request(THREE, { mode: 'no-cors' })); } catch (err) {}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (r.url === THREE) {
    e.respondWith(caches.match(r).then(m => m || fetch(new Request(THREE, { mode: 'no-cors' })).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
  }
});
