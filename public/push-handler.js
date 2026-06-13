/** معالجات Web Push — تُحمَّل في service worker عبر importScripts */
self.addEventListener('push', (event) => {
  let payload = {
    title: 'حلاق ماب',
    body: 'رسالة عميل جديدة',
    tag: 'barber-chat',
    url: '/#/barber/dashboard?tab=messages',
    kind: 'message',
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    /* keep defaults */
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const dashboardFocused = clients.some((client) => {
          if (!client.focused) return false;
          const url = String(client.url || '');
          return url.includes('/barber/dashboard') || url.includes('#/barber/dashboard');
        });
        if (dashboardFocused) return undefined;
        return self.registration.showNotification(payload.title, {
          body: payload.body,
          tag: payload.tag,
          data: { url: payload.url, kind: payload.kind },
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          dir: 'rtl',
          lang: 'ar',
        });
      }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = String(event.notification.data?.url || '/#/barber/dashboard?tab=messages');
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const absolute = targetUrl.startsWith('http')
          ? targetUrl
          : `${self.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;
        return self.clients.openWindow(absolute);
      }
      return undefined;
    }),
  );
});
