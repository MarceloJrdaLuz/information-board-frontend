import { IDayScheduleInput } from "@/types/publicWitness/schedules"
import { atom } from "jotai"
import { CreatePublicWitnessMonthSchedulePayload } from "./types"
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
        messageSuccess: "Programação criada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      console.error(err)
      _set(handleSubmitErrorAtom, {
        messageError: "Erro ao criar a programação."
      })
      throw err
    }
  }
)
