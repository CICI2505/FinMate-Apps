import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' ||
        url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Cache Font Awesome
registerRoute(
    ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' &&
        url.pathname.includes('fontawesome'),
    new CacheFirst({
        cacheName: 'font-awesome',
    })
);

// Cache OpenStreetMap Tiles
registerRoute(
    ({ url }) => url.origin === 'https://tile.openstreetmap.org',
    new CacheFirst({
        cacheName: 'openstreetmap-tiles',
    })
);

// Cache Leaflet Marker Assets
registerRoute(
    ({ url }) => url.origin === 'https://cdnjs.cloudflare.com' &&
        url.pathname.includes('leaflet'),
    new CacheFirst({
        cacheName: 'leaflet-assets',
    })
);

// Cache Story API Data (Network First)
registerRoute(
    ({ url }) => url.origin === 'https://story-api.dicoding.dev' &&
        url.pathname.startsWith('/v1/stories'),
    new NetworkFirst({
        cacheName: 'stories-api',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Cache Story Images (Stale While Revalidate)
registerRoute(
    ({ url }) => url.origin === 'https://story-api.dicoding.dev' &&
        url.pathname.includes('/images/stories/'),
    new StaleWhileRevalidate({
        cacheName: 'story-images',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Event Listeners (tetap sama seperti sebelumnya)
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log('Service Worker activated');
});

self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    let notificationData = {
        title: 'New Notification',
        body: 'Some User Add New Story',
    };

    try {
        if (event.data) {
            notificationData = event.data.json();
        }
    } catch (e) {
        console.log('Failed to parse push data:', e);
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body || notificationData.options?.body,
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});