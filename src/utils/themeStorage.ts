/**
 * Grava o tema atual no IndexedDB (banco AppPreferences -> settings -> theme).
 * Permite que o Service Worker leia o tema do usuário mesmo quando a aplicação estiver fechada.
 */
export function saveThemeToIndexedDB(theme: string) {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return

  try {
    const request = indexedDB.open('AppPreferences', 1)
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
    }
    request.onsuccess = (event: any) => {
      try {
        const db = event.target.result
        const tx = db.transaction('settings', 'readwrite')
        const store = tx.objectStore('settings')
        store.put(theme, 'theme')
      } catch (err) {
        console.warn('Erro ao salvar tema no IndexedDB:', err)
      }
    }
  } catch (err) {
    console.warn('Erro ao abrir IndexedDB para salvar tema:', err)
  }
}

