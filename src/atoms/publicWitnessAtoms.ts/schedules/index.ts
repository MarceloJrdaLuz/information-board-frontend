import { IDayScheduleInput } from "@/types/publicWitness/schedules"
import { atom } from "jotai"
import {
  CreatePublicWitnessMonthSchedulePayload,
  GeneratePublicWitnessSchedulePayload,
  UpdateSlotPreferencesPayload
} from "./types"
import { API_ROUTES } from "@/constants/apiRoutes"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "@/atoms/handleSubmitAtom"
import { api } from "@/services/api"

export const monthScheduleAtom = atom<Record<string, IDayScheduleInput>>({})

export const dirtyMonthScheduleAtom = atom<Record<string, IDayScheduleInput>>({})

export const createSchedulePublicWitnessAtom = atom(
  null,
  async (_get, _set, arrangement_id: string, payload: CreatePublicWitnessMonthSchedulePayload) => {
    try {
      const res = await api.post(
        `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}/schedules`,
        payload
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Programação salva com sucesso!",
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: err.response?.data?.message || "Erro ao salvar a programação."
      })
      throw err
    }
  }
)

export const generatePublicWitnessScheduleAtom = atom(
  null,
  async (_get, _set, arrangement_id: string, payload: GeneratePublicWitnessSchedulePayload) => {
    try {
      const res = await api.post(
        `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}/generate-schedules`,
        payload
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: res.data?.message || "Programação gerada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: err.response?.data?.message || "Erro ao gerar a programação automática."
      })
      throw err
    }
  }
)

export const updateSlotPreferencesAtom = atom(
  null,
  async (_get, _set, arrangement_id: string, payload: UpdateSlotPreferencesPayload) => {
    try {
      const res = await api.patch(
        `${API_ROUTES.PUBLIC_WITNESS_ARRANGEMENTS}/${arrangement_id}/slot-preferences`,
        payload
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Preferências salvas com sucesso!",
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: err.response?.data?.message || "Erro ao salvar preferências."
      })
      throw err
    }
  }
)
