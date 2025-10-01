// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        const swStatus = document.getElementById('swStatus');
        
        navigator.serviceWorker.register('/service_worker.js')
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

// Обработка онлайн/офлайн статуса
window.addEventListener('online', function() {
    const swStatus = document.getElementById('swStatus');
    if (swStatus) {
        swStatus.innerHTML = '✅ Cache Ready <small>(online)</small>';
    }
});

window.addEventListener('offline', function() {
    const swStatus = document.getElementById('swStatus');
    if (swStatus) {
        swStatus.innerHTML = '⚠️ Cache Ready <small>(offline)</small>';
    }
});

// Основной код приложения
const feedElement = document.getElementById("feed"),
    loadingIndicator = document.getElementById("loadingIndicator"),
    mockData = [
        {id:1,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image12-optimized.jpg"},date:"Today",author:"Author"},
        {id:2,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image2-optimized.jpg"},date:"Today",author:"Author"},
        {id:3,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image3-optimized.jpg"},date:"Today",author:"Author"},
        {id:4,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image4-optimized.jpg"},date:"Today",author:"Author"},
        {id:5,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image5-optimized.jpg"},date:"Today",author:"Author"},
        {id:6,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image6-optimized.jpg"},date:"Today",author:"Author"},
        {id:7,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image7-optimized.jpg"},date:"Today",author:"Author"},
        {id:8,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image8-optimized.jpg"},date:"Today",author:"Author"},
        {id:9,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image9-optimized.jpg"},date:"Today",author:"Author"},
        {id:10,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image10-optimized.jpg"},date:"Today",author:"Author"},
        {id:11,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image11-optimized.jpg"},date:"Today",author:"Author"},
        {id:12,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image1-optimized.jpg"},date:"Today",author:"Author"},
        {id:13,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image13-optimized.jpg"},date:"Today",author:"Author"},
        {id:14,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image14-optimized.jpg"},date:"Today",author:"Author"},
        {id:15,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image15-optimized.jpg"},date:"Today",author:"Author"},
        {id:16,title:"Lorem ipsum",description:"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa.",media:{type:"image",url:"images/image16-optimized.jpg"},date:"Today",author:"Author"}
    ];

let currentPage = 0;
const itemsPerPage = 5;
let isLoading = false;
let observer;

function createFeedItem(item) {
    const itemElement = document.createElement("div");
    itemElement.className = "feed-item";
    itemElement.setAttribute("data-id", item.id);
    
    let mediaHTML = "";
    if (item.media.type === "image") {
        mediaHTML = `
            <div class="feed-item-media">
                <img data-src="${item.media.url}" alt="${item.title}" class="lazy">
                <div class="placeholder">Изображение загружается...</div>
            </div>
        `;
    }
    
    itemElement.innerHTML = `
        <div class="feed-item-header">
            <h2 class="feed-item-title">${item.title}</h2>
            <div class="feed-item-meta">
                <span class="feed-item-author">Автор: ${item.author}</span>
                <span class="feed-item-date">${item.date}</span>
            </div>
        </div>
        <div class="feed-item-content">
            <p class="feed-item-description">${item.description}</p>
            ${mediaHTML}
        </div>
    `;
    
    return itemElement;
}

function loadData(page) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const data = mockData.slice(start, end);
            
            if (data.length > 0) {
                resolve(data);
            } else {
                reject(new Error("Больше данных нет"));
            }
        }, 1000);
    });
}

function renderItems(items) {
    items.forEach(item => {
        const itemElement = createFeedItem(item);
        feedElement.appendChild(itemElement);
    });
    initLazyLoading();
}

function initLazyLoading() {
    if (observer) {
        observer.disconnect();
    }
    
    const lazyElements = document.querySelectorAll(".lazy");
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.tagName === "IMG") {
                    element.src = element.getAttribute("data-src");
                }
                
                element.src = element.getAttribute("data-src");
                element.classList.remove("lazy");
                
                element.onload = () => {
                    const placeholder = element.parentNode.querySelector(".placeholder");
                    if (placeholder) {
                        placeholder.style.display = "none";
                    }
                };
                
                element.onerror = () => {
                    const placeholder = element.parentNode.querySelector(".placeholder");
                    if (placeholder) {
                        placeholder.textContent = "Ошибка загрузки медиа";
                        placeholder.style.color = "#e74c3c";
                    }
                };
                
                observer.unobserve(element);
            }
        });
    });
    
    lazyElements.forEach(element => {
        observer.observe(element);
    });
}

async function loadNextPage() {
    if (!isLoading) {
        isLoading = true;
        loadingIndicator.style.display = "block";
        
        try {
            const items = await loadData(currentPage);
            renderItems(items);
            currentPage++;
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            showError("Не удалось загрузить данные");
        } finally {
            isLoading = false;
            loadingIndicator.style.display = "none";
        }
    }
}

function showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    feedElement.appendChild(errorElement);
}

function handleInfiniteScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (documentHeight - 500 <= scrollY + windowHeight && !isLoading) {
        loadNextPage();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadNextPage();
    window.addEventListener("scroll", handleInfiniteScroll);
});