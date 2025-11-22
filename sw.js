const CACHE_NAME = 'herbal-medicine-v3';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './chshm-01.html',
    './taghviat-01.html',
    './eskelet-01.html',
    './ghalbi-01.html',
    './kolie-01.html',
    './poosti-01.html',
    './gova-01.html',
    './asab-01.html',
    './tanafosi-01.html'
];

// نصب Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// فعال سازی Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// مدیریت درخواست‌ها
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // اگر فایل در کش وجود دارد، از کش برگردان
                if (response) {
                    return response;
                }
                
                // در غیر این صورت از شبکه دریافت کن
                return fetch(event.request)
                    .then(function(response) {
                        // بررسی که پاسخ معتبر باشد
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // کلون پاسخ برای ذخیره در کش
                        var responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function() {
                        // اگر آفلاین هستیم و فایل در کش نیست
                        // می‌توانید یک صفحه آفلاین نمایش دهید
                        return new Response('آفلاین هستید. لطفاً اتصال اینترنت خود را بررسی کنید.', {
                            status: 408,
                            headers: {'Content-Type': 'text/plain; charset=utf-8'}
                        });
                    });
            })
    );
});