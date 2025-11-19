// Service Worker for Push Notifications
console.log('[SW Push] Handler loaded successfully');

// Handle push notification events
self.addEventListener('push', function(event) {
  console.log('[SW Push] Push event received:', event);
  
  let notificationData = {
    title: 'Magang Portal',
    body: 'Anda memiliki notifikasi baru',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };
  
  // Try to parse push data
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW Push] Parsed JSON data:', data);
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || {},
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        silent: false,
        vibrate: [200, 100, 200]
      };
    } catch (e) {
      console.log('[SW Push] Failed to parse JSON, using text:', e);
      try {
        const text = event.data.text();
        notificationData.body = text || notificationData.body;
      } catch (textError) {
        console.error('[SW Push] Failed to get text:', textError);
      }
    }
  }
  
  console.log('[SW Push] Showing notification:', notificationData);
  
  // Show notification with error handling and permission check
  event.waitUntil(
    (async function() {
      try {
        // Check if we have permission (this should always be true in SW context, but let's be safe)
        await self.registration.showNotification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          badge: notificationData.badge,
          vibrate: notificationData.vibrate,
          tag: notificationData.tag,
          requireInteraction: notificationData.requireInteraction,
          silent: notificationData.silent,
          data: notificationData.data
        });
        console.log('[SW Push] ✅ Notification shown successfully');
      } catch (error) {
        console.error('[SW Push] ❌ Failed to show notification:', error);
        // Try minimal fallback notification
        try {
          await self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon
          });
          console.log('[SW Push] ✅ Fallback notification shown');
        } catch (fallbackError) {
          console.error('[SW Push] ❌ Even fallback failed:', fallbackError);
          // Log but don't throw - we don't want to break the service worker
        }
      }
    })()
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[SW Push] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(windowClients) {
        // Check if window is already open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[SW Push] Notification closed:', event);
});