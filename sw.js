// =================================================================================================
// OFFLINE RESOURCE CACHE
// =================================================================================================
const CACHE_PREFIX = 'inventaire-bieres-';
const CACHE = `${CACHE_PREFIX}v2`;
const ASSETS = ['./', './index.html', './app.js', './inventory.json', './manifest.webmanifest', './icon.svg'];
const ASSET_URLS = new Set(ASSETS.map(asset => new URL(asset, self.registration.scope).href));

self.addEventListener('install', event => {
 // ------------------------------------------
 // Cache a complete application before activation
 event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const requests = ASSETS.map(asset => new Request(asset, {cache: 'reload'}));
  await cache.addAll(requests);
  await self.skipWaiting();
 })());
});

self.addEventListener('activate', event => {
 // ------------------------------------------
 // Remove only outdated application caches
 event.waitUntil((async () => {
  const keys = await caches.keys();
  const obsolete = keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE);
  await Promise.all(obsolete.map(key => caches.delete(key)));
  await self.clients.claim();
 })());
});

async function fetchResource(request) {
 // ------------------------------------------
 // Refresh online resources and fall back to the offline copy
 const cache = await caches.open(CACHE);
 try {
  const response = await fetch(new Request(request, {cache: 'no-store'}));
  if (response.ok) await cache.put(request, response.clone());
  return response;
 } catch (error) {
  const cached = await cache.match(request);
  if (cached) return cached;
  throw error;
 }
}

self.addEventListener('fetch', event => {
 // ------------------------------------------
 // Handle only application resources
 if (event.request.method !== 'GET') return;
 if (!ASSET_URLS.has(event.request.url)) return;
 event.respondWith(fetchResource(
  event.request));
});
