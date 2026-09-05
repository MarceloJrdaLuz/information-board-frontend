let currentAppTheme = ''

// Escuta mensagem da aplicação informando o tema atual
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SET_THEME') {
    currentAppTheme = event.data.theme || ''
  }
})

self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    var payload = event.data.json()
    var title = payload.title || 'Quadro de Informações'

    // Mapeamento dinâmico do ícone da direita de acordo com o tipo da notificação
    // Determina o tema (pode vir no payload ou sincronizado via message)
    var activeTheme = payload.data?.theme || payload.theme || currentAppTheme || ''
    var themeFolder = activeTheme ? activeTheme + '/' : ''

    // Mapeamento dinâmico do ícone da direita de acordo com o tipo da notificação e a cor do tema
    var typeIcons = {
      SPEAKER: '/icons/notifications/' + themeFolder + 'speaker.png',
      READING: '/icons/notifications/' + themeFolder + 'reading.png',
      CHAIRMAN: '/icons/notifications/' + themeFolder + 'chairman.png',
      CLEANING: '/icons/notifications/' + themeFolder + 'cleaning.png',
      FIELD_SERVICE: '/icons/notifications/' + themeFolder + 'field_service.png',
      PUBLICWITNESS: '/icons/notifications/' + themeFolder + 'publicwitness.png',
      HOSPITALITY: '/icons/notifications/' + themeFolder + 'hospitality.png',
      REMINDER: '/icons/notifications/' + themeFolder + 'reminder.png',
    }

    var notifType = payload.data?.type || payload.type
    var iconUrl = payload.icon || (notifType && typeIcons[notifType]) || ('/icons/notifications/' + themeFolder + 'reminder.png')

    var options = {
      body: payload.body || '',
      icon: iconUrl,
      badge: payload.badge || '/icons/badge.png', // Ícone monocromático para a barra de status
      vibrate: [100, 50, 100],
      data: payload.data || { url: '/dashboard' },
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    var text = event.data.text()
    var themeFolder = currentAppTheme ? currentAppTheme + '/' : ''
    event.waitUntil(
      self.registration.showNotification('Quadro de Informações', {
        body: text,
        icon: '/icons/notifications/' + themeFolder + 'reminder.png',
        badge: '/icons/badge.png', // Ícone monocromático para a barra de status
        data: { url: '/dashboard' },
      })
    )
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  var urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
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
