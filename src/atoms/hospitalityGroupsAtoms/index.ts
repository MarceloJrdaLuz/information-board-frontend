import { api } from "@/services/api"
import { IHospitalityGroup } from "@/types/types"
import { atom } from "jotai"
import { toast } from "react-toastify"
import { CreateHospitalityGroupPayload, UpdateHospitalityGroupPayload } from "./types"

export const createHospitalityGroupAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateHospitalityGroupPayload) => {
    try {
      const res = await api.post(`/congregation/${congregation_id}/hospitalityGroup`, payload)

      toast.success("Grupo de hospitalidade criado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Some members were not found") {
        toast.error("Alguns membros não foram encontrados")
      } else if (message?.includes("already exists")) {
        toast.error("Já existe um grupo de hospitalidade com esse nome.")
      } else {
        console.error(err)
        toast.error("Erro ao criar orador.")
      }
      throw err
    }
  }
)

export const updateHospitalityGroupAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, hospitalityGroup_id: string, payload: UpdateHospitalityGroupPayload) => {
    try {
      console.log(hospitalityGroup_id)
      const res = await api.patch(`/hospitalityGroup/${hospitalityGroup_id}`, payload)

      toast.success("Grupo de hospitalidade atualizado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      // if (message === "Publisher does not belong to the same congregation as the hospitalityGroup") {
      //   toast.error("O publicador não pertence à mesma congregação.")
      // } else if (message?.includes("already exists")) {
      //   toast.error("Já existe um orador com esse nome/publicador na congregação.")
      // } else {
      //   console.error(err)
      //   toast.error("Erro ao atualizar o grupo.")
      // }
      // throw err
    }
  }
)

export const deleteHospitalityGroupAtom = atom(
  null,
  async (_get, _set, hospitalityGroup_id: string) => {
    try {
      await api.delete(`/hospitalityGroup/${hospitalityGroup_id}`)

      toast.success("Grupo de hospitalidade excluído com sucesso!")
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "HospitalityGroup not found") {
        toast.error("Grupo de hospitalidade não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao excluir o grupo.")
      }
      throw err
    }
  }
)

export const selectedHospitalityGroupAtom = atom<IHospitalityGroup | null>(null)


