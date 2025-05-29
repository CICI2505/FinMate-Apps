self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

self.addEventListener('push', function (event) {
  const options = {
    body: event.data?.text() || 'You have a new message!',
    icon: '/icon.png',
    badge: '/badge.png',
  };

  event.waitUntil(
    self.registration.showNotification('Push Notification', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('http://localhost:9000') // Ganti dengan URL tujuan jika perlu
  );
});

self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');
 
  async function chainPromise() {
    await self.registration.showNotification('Ada laporan baru untuk Anda!', {
      body: 'Terjadi kerusakan lampu jalan di Jl. Melati',
    });
  }
 
  event.waitUntil(chainPromise());
});
