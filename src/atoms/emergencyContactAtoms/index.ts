import { api } from "@/services/api"
import { atom } from "jotai"
import { toast } from "react-toastify"

// export const createExternalAtom = atom(
//   null, // valor inicial → write-only atom
//   async (_get, _set, congregation_id: string, payload: CreateEmergencyContactsPayload) => {
//     try {
//       const res = await api.post(`/${congregation_id}/emergencyContacts`, payload)

//       toast.success("Saída de oradores atualizada com sucesso!")
//       return res.data
//     } catch (err: any) {
//       const message = err?.response?.data?.message

//       toast.error("Erro ao criar a programação.")
//       throw err
//     }
//   }
// )

// export const updateExternalTalkAtom = atom(
//   null, // valor inicial → write-only atom
//   async (_get, _set, externalTalk_id: string, payload: UpdateExternalTalksPayload) => {
//     try {
//       const res = await api.patch(`/externalTalk/${externalTalk_id}`, payload)
//       toast.success("Saída de oradores atualizada com sucesso!")
//       return res.data
//     } catch (err: any) {
//       const message = err?.response?.data?.message

//       toast.error("Erro ao atualizar o discurso.")
//       throw err
//     }
//   }
// )

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