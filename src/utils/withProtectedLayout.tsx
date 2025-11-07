import { ProtectedRoute } from "@/Components/ProtectedRoute"
import Layout from "@/Components/Layout"
import { ReactElement } from "react"

/**
 * Helper para proteger páginas com layout padrão e roles opcionais.
 *
 */
export function withProtectedLayout(allowedRoles?: string[]) {
  return function getLayout(page: ReactElement) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Layout>{page}</Layout>
      </ProtectedRoute>
    )
  }
}
