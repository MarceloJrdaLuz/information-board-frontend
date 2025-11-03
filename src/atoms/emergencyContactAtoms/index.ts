import { api } from "@/services/api"
import { atom } from "jotai"
import { toast } from "react-toastify"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { CreateEmergencyContactPayload, UpdateEmergencyContactPayload } from "./types"

export const createEmergencyContactAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, payload: CreateEmergencyContactPayload) => {
    try {
      const res = await api.post(`/emergencyContact`, payload)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Contato de emergência criado com sucesso!", 
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message
      _set(handleSubmitErrorAtom, {
        messageError: "Erro ao criar o contato de emêrgencia!"
      })
      throw err
    }
  }
)

export const updateEmergencyContactAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, emergencyContact_id: string, payload: UpdateEmergencyContactPayload) => {
    try {
      const res = await api.put(`/emergencyContact/${emergencyContact_id}`, payload)
      _set(handleSubmitSuccessAtom,  {
        messageSuccess: "Contato de emêrgencia atualizado com sucesso!", 
        redirectTo: "/congregacao/contatos-emergencia"
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message
      _set(handleSubmitErrorAtom, {
        messageError: "Erro ao atualizar o contato de emergência!"
      })
      throw err
    }
  }
)

export const deleteEmergencyContactAtom = atom(
  null,
  async (_get, _set, emergencyContact_id: string) => {
    try {
      await api.delete(`/emergencyContact/${emergencyContact_id}`)
      toast.success("Contato de emergência excluído com sucesso!")
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message  

      if (message === "EmergencyContact not found") {
        toast.error("Contato de emergência não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao excluir o contato de emergência.")
      }
      throw err
    }
  }
)