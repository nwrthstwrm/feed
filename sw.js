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
                // Используем улучшенное кэширование с обработкой ошибок
                return cacheAssetsWithFallback(cache, STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Installation completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
                // Все равно продолжаем установку даже с ошибками
                return self.skipWaiting();
            })
    );
});

// Активируем Service Worker  
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Очищаем старые кэши
            clearOldCaches()
        ])
    );
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

    // Для остальных запросов - Network First с fallback к кэшу
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Кэшируем успешные ответы
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Улучшенная функция кэширования с обработкой ошибок
async function cacheAssetsWithFallback(cache, assets) {
    const results = await Promise.allSettled(
        assets.map(asset => {
            return cache.add(asset).catch(error => {
                console.warn(`Service Worker: Failed to cache ${asset}`, error);
                // Возвращаем успешный промис, чтобы не прерывать цепочку
                return Promise.resolve();
            });
        })
    );

    // Анализируем результаты
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Service Worker: Caching completed - ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
        console.warn(`Service Worker: ${failed} assets failed to cache`);
    }
    
    return Promise.resolve();
}

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
        // Возвращаем заглушку или пытаемся найти в основном кэше
        const fallbackResponse = await caches.match(request);
        return fallbackResponse || new Response('Image not available', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Очистка старых кэшей
async function clearOldCaches() {
    const cacheKeys = await caches.keys();
    const deletePromises = cacheKeys.map(key => {
        if (key !== CACHE_NAME && key !== IMAGE_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', key);
            return caches.delete(key);
        }
    });
    return Promise.all(deletePromises);
}