self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const title = payload.title || 'Quadro de Informações'

    // Mapeamento dinâmico do ícone da direita de acordo com o tipo da notificação
    const typeIcons = {
      SPEAKER: '/icons/notifications/speaker.png',
      READING: '/icons/notifications/reading.png',
      CHAIRMAN: '/icons/notifications/chairman.png',
      CLEANING: '/icons/notifications/cleaning.png',
      FIELD_SERVICE: '/icons/notifications/field_service.png',
      PUBLICWITNESS: '/icons/notifications/publicwitness.png',
      HOSPITALITY: '/icons/notifications/hospitality.png',
      REMINDER: '/icons/notifications/reminder.png',
    }

    const notifType = payload.data?.type || payload.type
    const iconUrl = payload.icon || (notifType && typeIcons[notifType]) || '/icons/notifications/reminder.png'

    const options = {
      body: payload.body || '',
      badge: payload.badge || '/icons/badge.png', // Ícone específico monocromático para a barra de status
      icon: iconUrl,
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
        icon: '/icons/notifications/reminder.png',
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
