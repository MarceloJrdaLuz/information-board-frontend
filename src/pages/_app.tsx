import { themeAtom } from '@/atoms/themeAtoms'
import Layout from '@/Components/Layout'
import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { DocumentsProvider } from '@/context/DocumentsContext'
import '@/styles/globals.css'
import { useSetAtom } from 'jotai'
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
  const setTheme = useSetAtom(themeAtom)
  const getLayout =
    Component.getLayout ??
    ((page) => <Layout>{page}</Layout>)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || ''
    document.documentElement.className = savedTheme
    setTheme(savedTheme as any)
  }, [setTheme])

  return (
    <AuthProvider>
      <CongregationProvider>
        <DocumentsProvider>
          <ToastContainer />
          {getLayout(<Component {...pageProps} />)}
        </DocumentsProvider>
      </CongregationProvider>
    </AuthProvider>
  )

}
