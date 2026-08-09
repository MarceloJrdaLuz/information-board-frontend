import { themeAtom } from '@/atoms/themeAtoms'
import Layout from '@/Components/Layout'
import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { DocumentsProvider } from '@/context/DocumentsContext'
import '@/styles/globals.css'
import { useAtomValue, useSetAtom } from 'jotai'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'
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
    const themeColors: Record<string, string> = {
      '': '#178582',
      'theme-dark': '#6F4EA1',
      'theme-blue': '#3E6BA3',
      'theme-purple': '#62468C',
    }

    const color = themeColors[theme] || '#178582'

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', color)
  }, [theme])

  return (
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
  )
}
