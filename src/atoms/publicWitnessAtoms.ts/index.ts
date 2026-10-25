import { API_ROUTES } from "@/constants/apiRoutes"
import { api } from "@/services/api"
import { atom } from "jotai"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import {
  CreatePublicWitnessArrangementPayload,
  UpdatePublicWitnessArrangementPayload
} from "./types"

export const createPublicWitnessArrangementAtom = atom(
  null,
  async (_get, _set, congregation_id: string, payload: CreatePublicWitnessArrangementPayload) => {
    try {
      const res = await api.post(
        `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/congregation/${congregation_id}`,
        payload
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Arranjo criado com sucesso!",
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: "Erro ao criar arranjo."
      })
      throw err
    }
  }
)

export const updatePublicWitnessArrangementAtom = atom(
  null,
  async (_get, _set, arrangement_id: string, payload: UpdatePublicWitnessArrangementPayload) => {
    try {
      const res = await api.patch(
        `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}`,
        payload
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Arranjo atualizado com sucesso!",
        redirectTo: "/congregacao/testemunho-publico"
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: "Erro ao criar arranjo."
      })
      throw err
    }
  }
)

export const updateArrangementPublishersAtom = atom(
  null,
  async (_get, _set, arrangement_id: string, publisher_ids: string[]) => {
    try {
      const res = await api.patch(
        `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}/publishers`,
        { publisher_ids }
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Participantes do rodízio atualizados com sucesso!",
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: err.response?.data?.message || "Erro ao atualizar participantes."
      })
      throw err
    }
  }
)

export const deletePublicWitnessArrangementAtom = atom(
  null,
  async (_get, _set, arrangement_id: string) => {
    try {
      await api.delete(`${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}`)
       _set(handleSubmitSuccessAtom, {
        messageSuccess: "Arranjo removido com sucesso!",
      })
      return true
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: "Erro ao excluir o arranjo."
      })
      throw err
    }
  }
)
