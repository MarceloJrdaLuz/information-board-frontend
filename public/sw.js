self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const title = payload.title || 'Quadro de Informações'
    const options = {
      body: payload.body || '',
      badge: payload.badge || '/icons/badge.png', // Ícone específico monocromático para a barra de status
      badge: payload.badge || '/icons/badge.png', // Ícone monocromático para a barra de status
      vibrate: [100, 50, 100],
      data: payload.data || { url: '/dashboard' },
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    const text = event.data.text()
    event.waitUntil(
      self.registration.showNotification('Quadro de Informações', {
        body: text,
        badge: '/icons/badge.png', // Ícone específico monocromático para a barra de status
        badge: '/icons/badge.png', // Ícone monocromático para a barra de status
        data: { url: '/dashboard' },
      })
    )
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url && 'focus' in client) {
          return client.focus().then(function () {
            return client.navigate(urlToOpen)
          })
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
