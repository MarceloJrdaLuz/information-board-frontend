import { themeAtom, themeColorsMap } from '@/atoms/themeAtoms'
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

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const theme = useAtomValue(themeAtom)
  const setTheme = useSetAtom(themeAtom)
  const getLayout =
    Component.getLayout ??
    ((page) => <Layout>{page}</Layout>)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || ''
    document.documentElement.className = savedTheme
    setTheme(savedTheme as any)
  }, [setTheme])

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
    const color = themeColorsMap[theme] || '#178582'

    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color)
    }

    let metaMsNav = document.querySelector('meta[name="msapplication-navbutton-color"]')
    if (metaMsNav) {
      metaMsNav.setAttribute('content', color)
    }

    let metaTile = document.querySelector('meta[name="msapplication-TileColor"]')
    if (metaTile) {
      metaTile.setAttribute('content', color)
    }
  }, [theme])

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content={currentThemeColor} />
        <meta name="msapplication-navbutton-color" content={currentThemeColor} />
        <meta name="msapplication-TileColor" content={currentThemeColor} />
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
