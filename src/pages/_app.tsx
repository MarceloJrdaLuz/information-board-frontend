import Layout from '@/Components/Layout'
import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { DocumentsProvider } from '@/context/DocumentsContext'
import { NoticesProvider } from '@/context/NoticeContext'
import { PermissionAndRolesProvider } from '@/context/PermissionAndRolesContext'
import { PublicDocumentsProvider } from '@/context/PublicDocumentsContext'
import { PublisherProvider } from '@/context/PublisherContext'
import { SubmitFormProvider } from '@/context/SubmitFormContext'
import { TerritoryProvider } from '@/context/TerritoryContext'
import '@/styles/globals.css'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { ReactElement, ReactNode } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ??
    ((page) => <Layout>{page}</Layout>)

  return (
    <SubmitFormProvider>
      <AuthProvider>
        <CongregationProvider>
          <TerritoryProvider>
            <DocumentsProvider>
              <PublisherProvider>
                <PermissionAndRolesProvider>
                  <NoticesProvider>
                    <ToastContainer />
                    <PublicDocumentsProvider>
                      {getLayout(<Component {...pageProps} />)}
                    </PublicDocumentsProvider>
                  </NoticesProvider>
                </PermissionAndRolesProvider>
              </PublisherProvider>
            </DocumentsProvider>
          </TerritoryProvider>
        </CongregationProvider>
      </AuthProvider>
    </SubmitFormProvider>
  )

}
