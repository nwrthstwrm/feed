// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        const swStatus = document.getElementById('swStatus');
        
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
                swStatus.textContent = '✅ Cache Ready';
                swStatus.className = 'service-worker-status status-online';
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
                swStatus.textContent = '❌ Cache Error';
                swStatus.className = 'service-worker-status status-offline';
            });
    });
}