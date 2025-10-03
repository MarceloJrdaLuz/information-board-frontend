import { api } from "@/services/api"
import { IExternalTalk } from "@/types/externalTalks"
import { atom } from "jotai"
import { toast } from "react-toastify"
import { CreateExternalTalksPayload, UpdateExternalTalksPayload } from "./types"

export const createExternalAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateExternalTalksPayload) => {
    try {
      const res = await api.post(`/congregation/${congregation_id}/externalTalks`, payload)

      toast.success("Saída de oradores atualizada com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      // if (message?.includes("already exists")) {
      //   toast.error("Já existe um programa pra umas das semanas")
      // } else {
      //   console.error(err)
      // }
      toast.error("Erro ao criar a programação.")
      throw err
    }
  }
)

export const updateExternalTalkAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, externalTalk_id: string, payload: UpdateExternalTalksPayload) => {
    try {
      const res = await api.patch(`/externalTalk/${externalTalk_id}`, payload)

      toast.success("Saída de oradores atualizada com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      // if (message === "A talk with this number already exists") {
      //   toast.error("Já existe um discurso com esse número")
      // } else {
      //   console.error(err)
      // }
      toast.error("Erro ao atualizar o discurso.")
      throw err
    }
  }
)

export const updateStatusExternalTalkAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, externalTalk_id: string, payload: { status: IExternalTalk['status'] }) => {
    try {
      const res = await api.patch(`/externalTalk/${externalTalk_id}/status`, payload)

      toast.success("Status atualizado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      // if (message === "A talk with this number already exists") {
      //   toast.error("Já existe um discurso com esse número")
      // } else {
      //   console.error(err)
      // }
      toast.error("Erro ao atualizar o status do discurso.")
      throw err
    }
  }
)