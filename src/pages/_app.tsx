import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { DocumentsProvider } from '@/context/DocumentsContext'
import { PermissionAndRolesProvider } from '@/context/PermissionAndRolesContext'
import { PublisherContext, PublisherProvider } from '@/context/PublisherContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CongregationProvider>
      <AuthProvider>
        <DocumentsProvider>
          <PublisherProvider>
            <PermissionAndRolesProvider>
              <ToastContainer />
              <Component {...pageProps} />
            </PermissionAndRolesProvider>
          </PublisherProvider>
        </DocumentsProvider>
      </AuthProvider>
    </CongregationProvider>
  )

}
