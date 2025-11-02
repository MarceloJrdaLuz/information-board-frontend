import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { LayoutSkeleton } from "../Layout/skeleton"

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children: React.ReactNode
}

export function ProtectedRoute({ allowedRoles = [], children }: ProtectedRouteProps) {
  const { roleContains, loading, user } = useAuthContext()
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // Enquanto o contexto ainda estiver carregando, não faz nada
    if (loading) return

    // Caso o recover do usuário tenha falhado (Unauthorized), o user será null
    if (!user) {
      // Evita erro de renderização, apenas redireciona
      setAuthorized(false)
      router.replace("/login")
      return
    }

    // Se nenhuma role for exigida, qualquer usuário logado passa
    if (allowedRoles.length === 0) {
      setAuthorized(true)
      return
    }

    // Verifica se o usuário tem permissão
    const hasPermission = allowedRoles.some(role => roleContains(role))
    if (!hasPermission) {
      setAuthorized(false)
      router.replace("/dashboard") // ou página "sem permissão"
      return
    }

    // Se tudo certo, permite renderizar
    setAuthorized(true)
  }, [loading, user, allowedRoles, roleContains, router])

  // Enquanto não souber o estado do usuário, mostra skeleton
  if (loading || authorized === null) {
    return <LayoutSkeleton />
  }

  // Bloqueia renderização enquanto redireciona
  if (!authorized) {
    return null
  }

  return <>{children}</>
}
