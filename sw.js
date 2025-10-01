// service_worker.js
const CACHE_NAME = 'image-cache-v1';
const IMAGE_CACHE_NAME = 'images-cache-v1';

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
    '/',
    '/index.html', 
    '/main.css',
    '/main.js',
    '/images/image1-optimized.jpg',
    '/images/image2-optimized.jpg',
    '/images/image3-optimized.jpg',
    '/images/image4-optimized.jpg',
    '/images/image5-optimized.jpg',
    '/images/image6-optimized.jpg',
    '/images/image7-optimized.jpg',
    '/images/image8-optimized.jpg',
    '/images/image9-optimized.jpg',
    '/images/image10-optimized.jpg',
    '/images/image11-optimized.jpg',
    '/images/image12-optimized.jpg',
    '/images/image13-optimized.jpg',
    '/images/image14-optimized.jpg',
    '/images/image15-optimized.jpg',
    '/images/image16-optimized.jpg',
];

// Устанавливаем Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Активируем Service Worker  
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});

// Обрабатываем запросы - КЭШИРУЕМ ИЗОБРАЖЕНИЯ
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Обрабатываем запросы изображений
    if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        event.respondWith(handleImageRequest(event.request));
        return;
    }

    // Для остальных запросов
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});

// Стратегия для изображений: Cache First
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    
    // Сначала пытаемся получить из кэша
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        console.log('Service Worker: Serving image from cache', request.url);
        return cachedResponse;
    }

    // Если в кэше нет, загружаем из сети и кэшируем
    try {
        console.log('Service Worker: Fetching image from network', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed for image', request.url);
        return new Response('Image not available');
    }
}