import { AuthProvider } from '@/context/AuthContext'
import { CongregationProvider } from '@/context/CongregationContext'
import { PermissionAndRolesProvider } from '@/context/PermissionAndRolesContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CongregationProvider>
      <AuthProvider>
        <PermissionAndRolesProvider>
          <ToastContainer />
          <Component {...pageProps} />
        </PermissionAndRolesProvider>
      </AuthProvider>
    </CongregationProvider>
  )

}
