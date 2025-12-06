import { API_ROUTES } from "@/constants/apiRoutes"
import { api } from "@/services/api"
import { IHospitalityGroup } from "@/types/types"
import { atom } from "jotai"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { CreateCleaningGroupPayload, UpdateCleaningGroupPayload } from "./types"

export const createCleaningGroupAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateCleaningGroupPayload) => {
    try {
      const res = await api.post(`${API_ROUTES.CLEANING_GROUPS}/congregation/${congregation_id}`, payload)

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Grupo de limpeza criado com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Order must be a positive integer") {
        _set(handleSubmitErrorAtom, {
          messageError: "Número deve ser positivo"
        })
      } else if (message?.includes("already exists")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Já existe um grupo de limpeza com esse nome."
        })
      } else if (message?.includes("One or more publishers do not belong to the congregation")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Um ou mais publicadores não pertencem a congregação."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar o grupo de limpeza."
        })
      }
      throw err
    }
  }
)

export const updateCleaningGroupAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, group_id: string, payload: UpdateCleaningGroupPayload) => {
    try {
      const res = await api.patch(`${API_ROUTES.CLEANING_GROUPS}/${group_id}`, payload)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Grupo de limpeza atualizado com sucesso!",
        redirectTo: "/congregacao/grupos-limpeza"
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Cleaning group not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Grupo de limpeza não encontrado."
        })
      } else if (message === "One or more publishers do not belong to the congregation") {
        _set(handleSubmitErrorAtom, {
          messageError: "Um ou mais publicadores não pertencem a congregação."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao atualizar o grupo de limpeza."
        })
      }
      throw err
    }
  }
)

export const deleteCleaningGroupAtom = atom(
  null,
  async (_get, _set, group_id: string) => {
    try {
      await api.delete(`${API_ROUTES.CLEANING_GROUPS}/${group_id}`)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Grupo de hospitalidade excluído com sucesso!",
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Cleaning group not found") {
        4
        _set(handleSubmitErrorAtom, {
          messageError: "Grupo de limpeza não encontrado."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir o grupo."
        })
      }
      throw err
    }
  }
)

