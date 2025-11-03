import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles = [], children }: ProtectedRouteProps) {
  const { authResolved, roleContains, loading, user, } = useAuthContext()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!authResolved) return // espera resolver autenticação

    if (!user) {
      router.replace("/login")
      return
    }

    if (allowedRoles.length === 0) {
      setAuthorized(true)
      return
    }

    const hasPermission = allowedRoles.some(role => roleContains(role))
    if (!hasPermission) {
      router.replace("/dashboard")
      return
    }

    setAuthorized(true)
  }, [authResolved, user, allowedRoles, roleContains, router])

  if (loading || authorized === null) {
    return null
  }

  if (!authorized) return null

  return <>{children}</>
}
