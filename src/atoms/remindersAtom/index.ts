import { api } from "@/services/api"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { CreateReminderPayload, UpdateReminderPayload } from "./types"
import { atom } from "jotai"
import { API_ROUTES } from "@/constants/apiRoutes"

export const createReminderAtom = atom(
  null,
  async (_get, _set, publisher_id: string, payload: CreateReminderPayload) => {
    try {
      const res = await api.post(
        `${API_ROUTES.PUBLISHER_REMINDERS}/publishers/${publisher_id}`,
        payload
      )
      _set(handleSubmitSuccessAtom, { messageSuccess: "Lembrete criado!" })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Publisher not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Publicador não encontrado."
        })
      } else if (message === "Title is required") {
        _set(handleSubmitErrorAtom, {
          messageError: "Título é obrigatório."
        })
      } else if (message === "startDate is required") {
        _set(handleSubmitErrorAtom, {
          messageError: "Data inicial é obrigatória."
        })
      } else if (message === "endDate is required") {
        _set(handleSubmitErrorAtom, {
          messageError: "Data final é obrigatória."
        })
      } else if (message === "endDate cannot be before startDate") {
        _set(handleSubmitErrorAtom, {
          messageError: "Data final não pode ser anterior à data inicial."
        })
      } else if (message === "recurrenceIntervalDays is required for recurring reminders") {
        _set(handleSubmitErrorAtom, {
          messageError: "Intervalo de recorrência é obrigatório para lembretes recorrentes."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar o lembrete."
        })
      }
      throw err
    }
  }
)


export const updateReminderAtom = atom(
  null,
  async (_get, _set, reminder_id: string, payload: UpdateReminderPayload) => {
    try {
      const res = await api.patch(
        `${API_ROUTES.PUBLISHER_REMINDERS}/${reminder_id}`,
        payload
      )
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Lembrete atualizado!",
        redirectTo: "/meus-lembretes"
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Reminder not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Lembrete não encontrada."
        })
      } else if (message === "endDate cannot be before startDate") {
        _set(handleSubmitErrorAtom, {
          messageError: "Data final não pode ser anterior a data inicial."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir o lembrete."
        })
      }
      throw err
    }
  }
)

export const deleteReminderAtom = atom(
  null,
  async (_get, _set, reminder_id: string) => {
    try {
      const res = await api.delete(`${API_ROUTES.PUBLISHER_REMINDERS}/${reminder_id}`)
      _set(handleSubmitSuccessAtom, { messageSuccess: "Lembrete excluído!" })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Reminder not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Lembrete não encontrada."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir o lembrete."
        })
      }
      throw err
    }
  }
)

export const completeReminderAtom = atom(
  null,
  async (_get, _set, reminder_id: string) => {
    try {
      const res = await api.post(`${API_ROUTES.PUBLISHER_REMINDERS}/${reminder_id}/complete`)
      _set(handleSubmitSuccessAtom, { messageSuccess: "Lembrete completo com sucesso!" })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Reminder not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Lembrete não encontrada."
        })
      } else if (message === "No active cycle to complete for this reminder") {
        _set(handleSubmitErrorAtom, {
          messageError: "Nenhum ciclo ativo para completar nesse lembrete."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao tentar atualizar o lembrete como concluído."
        })
      }
      throw err
    }
  }
)


