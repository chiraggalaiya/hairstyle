const staticCacheName = 'site-static-v1';
const assets = [
  '/',
  '/index.html',
  '/assets/css/animate.min.css',
  '/assets/css/f7.min.css',
  '/assets/css/fonts.css',
  '/assets/css/style.css',
  '/assets/fonts/material-icons.woff2',
  '/assets/images/icon.png',
  '/assets/images/icon-w-bg.png',
  '/assets/images/icon-w-bg-72x72.png',
  '/assets/images/icon-w-bg-96x96.png',
  '/assets/images/icon-w-bg-128x128.png',
  '/assets/images/icon-w-bg-144x144.png',
  '/assets/images/icon-w-bg-152x152.png',
  '/assets/images/icon-w-bg-192x192.png',
  '/assets/images/icon-w-bg-384x384.png',
  '/assets/images/icon-w-bg-512x512.png',
  '/assets/images/logo.png',
  '/assets/images/style1.png',
  '/assets/images/style2.png',
  '/assets/images/style3.png',
  '/assets/images/style4.png',
  '/assets/images/style5.png',
  '/assets/images/style6.png',
  '/assets/js/app.js',
  '/assets/js/f7.min.js',
  '/assets/js/f7.min.js.map',
  '/assets/js/face-api.min.js',
  '/assets/js/hairstyles.js',
  '/assets/js/interact.min.js',
  '/assets/js/maps.js',
  '/assets/models/face_landmark_68_tiny_model-shard1',
  '/assets/models/face_landmark_68_tiny_model-weights_manifest.json',
  '/assets/models/tiny_face_detector_model-shard1',
  '/assets/models/tiny_face_detector_model-weights_manifest.json',
];
// install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});
// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});
// fetch event
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});