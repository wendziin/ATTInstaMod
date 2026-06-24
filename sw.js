const CACHE_NAME = 'attinstamod-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app_logo.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (e) => {
  // Ignora chamadas de API do servidor para que elas sempre busquem na rede
  if (e.request.url.includes('/api/scrape')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Se a chamada de API falhar (ex: sem internet), retorna um JSON de erro
        return new Response(JSON.stringify({ error: 'Você está offline. Verifique sua conexão para carregar links atualizados.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Para outros assets, tenta buscar no cache primeiro, senão vai para a rede
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
