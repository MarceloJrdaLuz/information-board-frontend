import { atom } from "jotai"
import { api } from "@/services/api"
import { toast } from "react-toastify"
import { CreateTalkPayload, UpdateTalkPayload } from "./types"
import { ITalk } from "@/entities/types"

export const createTalkAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, payload: CreateTalkPayload) => {
    try {
      const res = await api.post("/talk", payload)

      toast.success("Discurso criado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "A talk with this number already exists") {
        toast.error("Já existe um discurso com esse número")
      } else {
        console.error(err)
        toast.error("Erro ao criar o discurso.")
      }
      throw err
    }
  }
)

export const updateTalkAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, talk_id: string,  payload: UpdateTalkPayload) => {
    try {
      const res = await api.patch(`/talk/${talk_id}`, payload)

      toast.success("Discurso atualizado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "A talk with this number already exists") {
        toast.error("Já existe um discurso com esse número")
      } else {
        console.error(err)
        toast.error("Erro ao atualizar o discurso.")
      }
      throw err
    }
  }
)

export const deleteTalkAtom = atom(
  null,
  async (_get, _set, talk_id: string) => {
    try {
      await api.delete(`/talk/${talk_id}`)

      toast.success("Discurso excluído com sucesso!")
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Talk not found") {
        toast.error("Orador não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao excluir o discurso.")
      }
      throw err
    }
  }
)

export const selectedTalkAtom = atom<ITalk | null>(null)

