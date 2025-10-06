import { api } from "@/services/api"
import { ISpeaker } from "@/types/types"
import { atom } from "jotai"
import { toast } from "react-toastify"
import { CreateSpeakerPayload, UpdateSpeakerPayload } from "./types"
import { handleSubmitSuccessAtom } from "../handleSubmitAtom"

export const createSpeakerAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, payload: CreateSpeakerPayload) => {
    try {
      const res = await api.post("/speaker", payload)
      toast.success("Orador criado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Publisher does not belong to the same congregation as the speaker") {
        toast.error("O publicador não pertence à mesma congregação.")
      } else if (message?.includes("already exists")) {
        toast.error("Já existe um orador com esse nome/publicador na congregação.")
      } else {
        console.error(err)
        toast.error("Erro ao criar orador.")
      }
      throw err
    }
  }
)

export const updateSpeakerAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, speaker_id: string, payload: UpdateSpeakerPayload) => {
    try {
      const res = await api.patch(`/speaker/${speaker_id}`, payload)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Orador atualizado com sucesso!",
        redirectTo: "/arranjo-oradores/oradores", 
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Publisher does not belong to the same congregation as the speaker") {
        toast.error("O publicador não pertence à mesma congregação.")
      } else if (message?.includes("already exists")) {
        toast.error("Já existe um orador com esse nome/publicador na congregação.")
      } else {
        console.error(err)
        toast.error("Erro ao atualizar orador.")
      }
      throw err
    }
  }
)

export const deleteSpeakerAtom = atom(
  null,
  async (_get, _set, speaker_id: string) => {
    try {
      await api.delete(`/speaker/${speaker_id}`)

      toast.success("Orador excluído com sucesso!")
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Speaker not found") {
        toast.error("Orador não encontrado.")
      } else {
        console.error(err)
        toast.error("Erro ao excluir orador.")
      }
      throw err
    }
  }
)

export const selectedSpeakerAtom = atom<ISpeaker | null>(null)


