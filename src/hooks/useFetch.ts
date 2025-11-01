import { useAuthContext } from "@/context/AuthContext"
import { api } from "@/services/api"
import useSWR from "swr"

export function useFetch<Data = any, Error = any>(url: string) {
    const { data, error, mutate, isLoading } = useSWR<Data, Error>(url !== '' ? url : null, async (url: string) => {
        const response = await api.get(url)

        return response.data
    })
    return { data, error, mutate, isLoading}
}
interface UseFetchOptions {
  allowedRoles?: string[]
}

export function useAuthorizedFetch<Data = any, Error = any>(
  url: string,
  options?: UseFetchOptions
) {
  const { user, roleContains, loading: authLoading } = useAuthContext()

  // Só ativa o SWR se:
  // - url não estiver vazia
  // - AuthContext já carregou
  // - Se tiver roles, o usuário tem permissão
  const shouldFetch =
    url &&
    !authLoading &&
    (!options?.allowedRoles || options.allowedRoles.some(r => roleContains(r)))

  const { data, error, mutate, isLoading } = useSWR<Data, Error>(
    shouldFetch ? url : null,
    async (url: string) => {
      const res = await api.get(url)
      return res.data
    }
  )

  return { data, error, mutate, isLoading }
}
