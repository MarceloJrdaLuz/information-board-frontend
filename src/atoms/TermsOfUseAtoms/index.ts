import { api } from "@/services/api"
import { atom } from "jotai"
import { toast } from "react-toastify"
import { CreateTermOfUsePayload } from "./types"

export const createTermOfUseAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, payload: CreateTermOfUsePayload) => {
    try {
      const res = await api.post("/terms", payload)
      toast.success("Termo de uso criado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "All fields are required: title, type, content, version") {
        toast.error("Todos os campos são obrigatórios: título, tipo, conteúdo, versão")
      } else if(message.includes("already exists")) {
        toast.error(message)
      } else {
        console.error(err)
        toast.error("Erro ao criar o termo de uso")
      }
      throw err
    }
  }
)

export const deleteTermOfUseAtom = atom(
  null,
  async (_get, _set, term_id: string) => {
    try {
      await api.delete(`/terms/${term_id}`)

      toast.success("Termos de uso excluído com sucesso!")
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Term not found") {
        toast.error("Termo de uso não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao excluir o termo.")
      }
      throw err
    }
  }
)
