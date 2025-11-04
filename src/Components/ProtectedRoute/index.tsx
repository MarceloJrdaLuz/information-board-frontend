import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles = [], children }: ProtectedRouteProps) {
  const { authResolved, roleContains, user } = useAuthContext()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // se ainda não resolveu a autenticação, não faz nada ainda
    if (!authResolved) return

    // usuário não autenticado
    if (!user) {
      router.replace("/login")
      return
    }

    // se não há restrição de roles, está autorizado
    if (allowedRoles.length === 0) {
      setAuthorized(true)
      return
    }

    // checa permissões
    const hasPermission = allowedRoles.some(role => roleContains(role))
    if (!hasPermission) {
      router.replace("/dashboard")
      return
    }

    // tudo ok
    setAuthorized(true)
  }, [authResolved, user, allowedRoles, roleContains, router])

  // 🔹 enquanto não resolvido ou ainda decidindo, não renderiza nada
  if (!authResolved || authorized === null) {
    return null
  }

  return <>{children}</>
}
