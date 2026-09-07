import { installPromptAtom } from '@/atoms/atom'
import { setThemeAtom, themeAtom, themeColorsMap, ThemeType, updateThemeColorMeta } from '@/atoms/themeAtoms'
import Layout from '@/Components/Layout'
import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { DocumentsProvider } from '@/context/DocumentsContext'
import '@/styles/globals.css'
import { useAtomValue, useSetAtom } from 'jotai'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ReactElement, ReactNode, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { saveThemeToIndexedDB } from '@/utils/themeStorage'

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const theme = useAtomValue(themeAtom)
  const changeTheme = useSetAtom(setThemeAtom)
  const getLayout =
    Component.getLayout ??
    ((page) => <Layout>{page}</Layout>)

  useEffect(() => {
    const validThemes = [
      '',
      'theme-dark',
      'theme-blue',
      'theme-purple',
      'theme-pink',
      'theme-dark-teal',
      'theme-dark-blue',
      'theme-dark-purple',
      'theme-dark-pink',
    ]
    const urlParams = new URLSearchParams(window.location.search)
    const urlTheme = urlParams.get('theme')

    if (urlTheme !== null) {
      localStorage.setItem('pwa_installed_theme', urlTheme)
      if (validThemes.includes(urlTheme)) {
        changeTheme(urlTheme as ThemeType)
        return
      }
    }

    const savedTheme = (localStorage.getItem('theme') || '') as ThemeType
    if (validThemes.includes(savedTheme)) {
      changeTheme(savedTheme)
    }
  }, [changeTheme])

  const setInstallPrompt = useSetAtom(installPromptAtom)

  useEffect(() => {
    // Se o evento foi capturado antes da hidratação do React
    if (typeof window !== 'undefined' && (window as any).__deferredInstallPrompt) {
      setInstallPrompt((window as any).__deferredInstallPrompt)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      ;(window as any).__deferredInstallPrompt = event
      setInstallPrompt(event)
    }

    const handlePromptCaptured = () => {
      if ((window as any).__deferredInstallPrompt) {
        setInstallPrompt((window as any).__deferredInstallPrompt)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('pwa-prompt-captured', handlePromptCaptured)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('pwa-prompt-captured', handlePromptCaptured)
    }
  }, [setInstallPrompt])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registrado com sucesso:', reg.scope))
        .catch((err) => console.error('Erro ao registrar Service Worker:', err))
    }
  }, [])

  const currentThemeColor = themeColorsMap[theme] || '#178582'

  useEffect(() => {
    updateThemeColorMeta(theme)

    const themeValue = theme || ''
    // 1. Salva a preferência de tema no IndexedDB local para acesso offline / SW com app fechado
    saveThemeToIndexedDB(themeValue)

    // 2. Notifica o Service Worker sobre o tema ativo
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_THEME',
          theme: themeValue,
        })
      }
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) {
          reg.active.postMessage({
            type: 'SET_THEME',
            theme: themeValue,
          })
        }
      })
    }
  }, [theme])

  return (
    <>
      <Head>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta key="theme-color" name="theme-color" content={currentThemeColor} />
        <meta
          key="theme-color-light"
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={currentThemeColor}
        />
        <meta
          key="theme-color-dark"
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content={currentThemeColor}
        />
        <meta key="ms-nav" name="msapplication-navbutton-color" content={currentThemeColor} />
        <meta key="ms-tile" name="msapplication-TileColor" content={currentThemeColor} />
      </Head>

      <AuthProvider>
        <CongregationProvider>
          <DocumentsProvider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              draggable
              className="toast-root"
              toastClassName="toast-item"
              bodyClassName="toast-body"
              progressClassName="toast-progress"
            />
            {getLayout(<Component {...pageProps} />)}
          </DocumentsProvider>
        </CongregationProvider>
      </AuthProvider>
    </>
  )
}
