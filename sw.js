const CACHE = 'er-bubu-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // API 请求直接走网络
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ error: 'offline' }), { status: 503 })));
    return;
  }

  // 导航请求：网络优先，失败返回内联刷新页（绝不回退脏缓存）
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', clone));
          return res;
        })
        .catch(() => {
          return caches.match('./index.html').then(cached => {
            return cached || new Response(
              `<!DOCTYPE html><html><head><meta charset=utf-8><meta name="viewport" content="width=device-width"><title>一二布布</title></head>
               <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;background:#f9f5f0;flex-direction:column;gap:12px;color:#6b5344;">
                 <div style="font-size:2rem">🐻</div>
                 <div>网络开小差啦，一二布布正在重试…</div>
                 <button onclick="location.reload()" style="padding:10px 24px;border:none;border-radius:24px;background:#e89a5c;color:#fff;font-size:1rem;cursor:pointer;">点击刷新</button>
               </body></html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // 静态资源：缓存优先
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => new Response('', { status: 404 }));
    })
  );
});
