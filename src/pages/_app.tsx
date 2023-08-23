import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { DocumentsProvider } from '@/context/DocumentsContext'
import { PermissionAndRolesProvider } from '@/context/PermissionAndRolesContext'
import { PublicDocumentsProvider } from '@/context/PublicDocumentsContext'
import { PublisherProvider } from '@/context/PublisherContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CongregationProvider>
        <DocumentsProvider>
          <PublisherProvider>
            <PermissionAndRolesProvider>
              <ToastContainer />
              <PublicDocumentsProvider>
                <Component {...pageProps} />
              </PublicDocumentsProvider>
            </PermissionAndRolesProvider>
          </PublisherProvider>
        </DocumentsProvider>
      </CongregationProvider>
    </AuthProvider>
  )

}
