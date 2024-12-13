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
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App({ Component, pageProps }: AppProps) {
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
                      <Component {...pageProps} />
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
