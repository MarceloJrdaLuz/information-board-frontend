import { ICongregation, IHospitalityGroup, IPublisher, ISpeaker, ITalk } from "@/entities/types"
import { IRecordWeekendSchedule, IWeekendSchedule } from "@/entities/weekendSchedule"
import { atom } from "jotai"
import { CreateWeekendSchedulePayload, UpdateWeekendSchedulePayload } from "./types"
import { api } from "@/services/api"
import { toast } from "react-toastify"
import { IExternalTalk } from "@/entities/externalTalks"

export const schedulesAtom = atom<Record<string, IRecordWeekendSchedule>>({})
export const speakersAtom = atom<ISpeaker[] | null>(null)
export const chairmansAtom = atom<IPublisher[] | null>(null)
export const readersAtom = atom<IPublisher[] | null>(null)
export const talksAtom = atom<ITalk[] | null>(null)
export const hospitalityGroupsAtom = atom<IHospitalityGroup[] | null>(null)
export const congregationsAtom = atom<ICongregation[] | null>(null)
export const externalTalksAtom = atom<IExternalTalk[] | null>(null)
export const specialEventToogleAtom = atom<boolean>(false)

export const speakerFilterCongregationAtom = atom<string | null>(null)
export const speakerFilterTalkAtom = atom<string | null>(null)

export const createWeekendScheduleAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string,  payload: CreateWeekendSchedulePayload) => {
    try {
      const res = await api.post(`/congregation/${congregation_id}/weekendSchedule`, payload)

      toast.success("Programações criadas com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message?.includes("already exists")) {
        toast.error("Já existe um programa pra umas das semanas")
      } else {
        console.error(err)
        toast.error("Erro ao criar a programação.")
      }
      throw err
    }
  }
)

export const updateWeekendScheduleAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set,  payload: UpdateWeekendSchedulePayload) => {
    try {
      const res = await api.patch(`/weekendSchedule/`, payload)

      toast.success("Programação atualizada com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "A talk with this number already exists") {
        toast.error("Já existe um discurso com esse número")
      } else {
        console.error(err)
        toast.error("Erro ao atualizar o discurso.")
      }
      throw err
    }
  }
)