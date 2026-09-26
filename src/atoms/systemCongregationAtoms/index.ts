import { api } from "@/services/api"
import { atom } from "jotai"
import { toast } from "react-toastify"

export const addAndUpdateSpeakerCoordinateAtom = atom(
  null,
  async (_get, _set, congregation_id: string, publisher_id: string) => {
    try {
      await api.post(`/congregation/${congregation_id}/speakerCoordinator/${publisher_id}`)
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Congregation not found") {
        toast.error("Congregação não encontrado.")
      } else if (message === "Publisher not found") {
        toast.error("Publicador não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao adicionar coordenador de discursos.")
      }
      throw err
    }
  }
)

export const addAndUpdateWatchtowerConductorAtom = atom(
  null,
  async (_get, _set, congregation_id: string, publisher_id: string) => {
    try {
      await api.post(`/congregation/${congregation_id}/watchtowerConductor/${publisher_id}`)
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Congregation not found") {
        toast.error("Congregação não encontrada.")
      } else if (message === "Publisher not found") {
        toast.error("Publicador não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao definir dirigente de A Sentinela.")
      }
      throw err
    }
  }
)
