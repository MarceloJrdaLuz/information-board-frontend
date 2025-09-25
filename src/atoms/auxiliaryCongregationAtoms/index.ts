import { ICongregation } from "@/entities/types"
import { atom } from "jotai"
import { api } from "@/services/api"
import { toast } from "react-toastify"
import { CreateAuxiliaryCongregationPayload, UpdateAuxiliaryCongregationPayload } from "./types"
import { handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { messageSuccessSubmit } from "@/utils/messagesSubmit"

export const createAuxiliaryCongregationAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, payload: CreateAuxiliaryCongregationPayload) => {
    try {
      const res = await api.post("/auxiliaryCongregations", payload)

      toast.success("Congregação criada com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Publisher does not belong to the same congregation as the congregation") {
        toast.error("O publicador não pertence à mesma congregação.")
      } else if (message?.includes("already exists")) {
        toast.error("Já existe uma congregação com esse número.")
      } else if (message?.includes("Unauthorized to create a system congregation")) {
        toast.error("Você não tem autorização para mudar esse tipo de congregação")
      } else {
        console.error(err)
        toast.error("Erro ao criar orador.")
      }
      throw err
    }
  }
)

export const updateAuxiliaryCongregationAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: UpdateAuxiliaryCongregationPayload) => {
    try {
      const res = await api.patch(`/auxiliaryCongregation/${congregation_id}`, payload)
       _set(handleSubmitSuccessAtom, {
        messageSuccess: "Congregação atualizada com sucesso!",
        redirectTo: "/arranjo-oradores/congregacoes"
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Congregation Id does not provided") {
        toast.error("Id da congregação não fornecido")
      } else if (message?.includes("Congregation was not found")) {
        toast.error("Congregação não encontrada")
      } else if (message?.includes("Unauthorized to create a system congregation")) {
        toast.error("Você não tem autorização para mudar esse tipo de congregação")
      } else {
        console.error(err)
        toast.error("Erro ao atualizar a congregação.")
      }
      throw err
    }
  }
)

export const deleteAuxiliaryCongregationAtom = atom(
  null,
  async (_get, _set, congregation_id: string) => {
    try {
      await api.delete(`/auxiliaryCongregation/${congregation_id}`)

      toast.success("Congregação excluída com sucesso!")
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Congregation not found") {
        toast.error("Congregação não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao excluir orador.")
      }
      throw err
    }
  }
)


export const selectedAuxiliaryCongregationAtom = atom<ICongregation | null>(null)
