import { themeAtom, themeColorsMap, ThemeType, updateThemeColorMeta } from '@/atoms/themeAtoms'
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
    const savedTheme = (localStorage.getItem('theme') || '') as ThemeType
    document.documentElement.className = savedTheme
    setTheme(savedTheme)
    updateThemeColorMeta(savedTheme)
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
    updateThemeColorMeta(theme)
  }, [theme])

  return (
    <>
      <Head>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
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
