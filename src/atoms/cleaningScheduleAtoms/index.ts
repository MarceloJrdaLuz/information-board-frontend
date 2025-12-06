import { API_ROUTES } from "@/constants/apiRoutes"
import { api } from "@/services/api"
import { CleaningScheduleMode } from "@/types/cleaning"
import { atom } from "jotai"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { CreateCleningExceptionPayload, GenerateCleaningSchedulePayload } from "./types"

export const generateCleaningScheduleAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: GenerateCleaningSchedulePayload) => {
    try {
      const res = await api.post(`/cleaning/generate-schedule/congregation/${congregation_id}?start=${payload.start}&end=${payload.end}`)

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Programação de limpeza criada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Invalid date format") {
        _set(handleSubmitErrorAtom, {
          messageError: "Formato de data inválido."
        })
      } else if (message === "end must be after start") {
        _set(handleSubmitErrorAtom, {
          messageError: "Data incial deve ser anterior a final."
        })
      } else if (message === "Congregation not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Congregação não encontrada"
        })
      } else if (message === "Cleaning schedule config not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Configuração da programação não encontrada."
        })
      } else if (message === "No groups found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Nenhum grupo de limpeza encontrado."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao gerar a programação de limpeza."
        })
      }
      throw err
    }
  }
)

export const createCleaningScheduleConfigAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, mode: CleaningScheduleMode) => {
    try {
      const res = await api.post(`${API_ROUTES.CLEANING_SCHEDULES_CONFIG}/congregation/${congregation_id}`, { mode })

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Configuração da programação de limpeza criada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Configuration already exists for this congregation") {
        _set(handleSubmitErrorAtom, {
          messageError: "Já existe uma configuração na congregação."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar a programação de limpeza."
        })
      }
      throw err
    }
  }
)

export const updateCleaningScheduleConfigAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, config_id: string, mode: CleaningScheduleMode) => {
    try {
      const res = await api.patch(`${API_ROUTES.CLEANING_SCHEDULES_CONFIG}/${config_id}`, { mode })

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Configuração da programação de limpeza atualizada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Cleaning schedule configuration not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Configuração não encontrada"
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar a configuração da programação de limpeza."
        })
      }
      throw err
    }
  }
)

export const createCleaningExceptionAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateCleningExceptionPayload) => {
    try {
      const res = await api.post(`${API_ROUTES.CLEANING_EXCEPTIONS}/congregation/${congregation_id}`, payload)

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Dia sem limpeza adicionado com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Cleaning schedule configuration not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Configuração não encontrada"
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar a configuração da programação de limpeza."
        })
      }
      throw err
    }
  }
)

export const deleteCleaningExceptionAtom = atom(
  null,
  async (_get, _set, exception_id: string) => {
    try {
      await api.delete(`${API_ROUTES.CLEANING_EXCEPTIONS}/${exception_id}`)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Dia excluído com sucesso!",
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Cleaning exception not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Dia para excluir não encontrado."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir a data."
        })
      }
      throw err
    }
  }
)
