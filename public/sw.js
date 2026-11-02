// Instalação e Ativação imediata do Service Worker
self.addEventListener('install', function (event) {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

let currentAppTheme = ''

// Auxiliares do IndexedDB para persistir e recuperar o tema mesmo com o app fechado
function getSavedTheme() {
  return new Promise(function (resolve) {
    try {
      if (typeof indexedDB === 'undefined') {
        return resolve('')
      }
      var request = indexedDB.open('AppPreferences', 1)
      request.onupgradeneeded = function (event) {
        var db = event.target.result
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      }
      request.onsuccess = function (event) {
        try {
          var db = event.target.result
          var tx = db.transaction('settings', 'readonly')
          var store = tx.objectStore('settings')
          var getReq = store.get('theme')
          getReq.onsuccess = function () {
            resolve(getReq.result || '')
          }
          getReq.onerror = function () {
            resolve('')
          }
        } catch (err) {
          resolve('')
        }
      }
      request.onerror = function () {
        resolve('')
      }
    } catch (e) {
      resolve('')
    }
  })
}

function saveThemeToIndexedDB(theme) {
  try {
    if (typeof indexedDB === 'undefined') return
    var request = indexedDB.open('AppPreferences', 1)
    request.onupgradeneeded = function (event) {
      var db = event.target.result
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
    }
    request.onsuccess = function (event) {
      try {
        var db = event.target.result
        var tx = db.transaction('settings', 'readwrite')
        var store = tx.objectStore('settings')
        store.put(theme, 'theme')
      } catch (err) {}
    }
  } catch (e) {}
}

// Normaliza o tema para a pasta correspondente dos icones
function resolveThemeFolder(theme) {
  if (!theme) return ''
  // Mapeia variacoes claras e escuras para a pasta correta existente em /icons/notifications/
  if (theme === 'theme-blue' || theme === 'theme-dark-blue') return 'theme-blue/'
  if (theme === 'theme-purple' || theme === 'theme-dark-purple') return 'theme-purple/'
  if (theme === 'theme-pink' || theme === 'theme-dark-pink') return 'theme-pink/'
  if (theme === 'theme-dark') return 'theme-dark/'
  return ''
}

// Escuta mensagem da aplicacao informando o tema atual
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SET_THEME') {
    currentAppTheme = event.data.theme || ''
    saveThemeToIndexedDB(currentAppTheme)
  }
})

self.addEventListener('push', function (event) {
  if (!event.data) return

  event.waitUntil(
    (async function () {
      try {
        var payload = event.data.json()
        var title = payload.title || 'Quadro de Informacoes'

        // Determina o tema: payload > memoria > IndexedDB
        var rawTheme = payload.data?.theme || payload.theme || currentAppTheme
        if (!rawTheme) {
          rawTheme = await getSavedTheme()
          if (rawTheme) {
            currentAppTheme = rawTheme
          }
        }

        // Converte o tema para a pasta correta em /icons/notifications/
        var themeFolder = resolveThemeFolder(rawTheme)

        // Mapeamento dinamico do icone da direita de acordo com o tipo da notificacao e a cor do tema
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
        var iconUrl =
          payload.icon ||
          (notifType && typeIcons[notifType]) ||
          ('/icons/notifications/' + themeFolder + 'reminder.png')

        var options = {
          body: payload.body || '',
          icon: iconUrl,
          badge: payload.badge || '/icons/badge.png',
          vibrate: [100, 50, 100],
          data: payload.data || { url: '/dashboard' },
        }

        await self.registration.showNotification(title, options)
      } catch (e) {
        var text = event.data.text()
        var rawTheme = currentAppTheme || (await getSavedTheme())
        var themeFolder = resolveThemeFolder(rawTheme)
        await self.registration.showNotification('Quadro de Informacoes', {
          body: text,
          icon: '/icons/notifications/' + themeFolder + 'reminder.png',
          badge: '/icons/badge.png',
          data: { url: '/dashboard' },
        })
      }
    })()
  )
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
