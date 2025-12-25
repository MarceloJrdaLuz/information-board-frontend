import { API_ROUTES } from "@/constants/apiRoutes"
import { api } from "@/services/api"
import { atom } from "jotai"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { CreateFieldServiceExceptionPayload, CreateFieldServicePayload, GenerateFieldService, UpdateFieldServicePayload } from "./types"

export const createFieldServiceAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateFieldServicePayload) => {
    try {
      const res = await api.post(`${API_ROUTES.FIELD_SERVICE_TEMPLATES}/congregation/${congregation_id}`, payload)

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Saída de campo criada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Missing required fields") {
        _set(handleSubmitErrorAtom, {
          messageError: "Algum campo obrigatório não foi preenchido."
        })
      } else if (message?.includes("Congregation not found")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Congregação não foi encontrada."
        })
      } else if (message === "FIXED service requires leader") {
        _set(handleSubmitErrorAtom, {
          messageError: "Saída de campo do tipo FIXO requer um dirigente."
        })
      } else if (message === "ROTATION service cannot have leader") {
        _set(handleSubmitErrorAtom, {
          messageError: "Saída de campo do tipo RODÍZIO não pode ter dirigente."
        })
      } else if (message === "Leader not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Dirigente não encontrado."
        })
      } else if (message === "ROTATION service cannot have leader") {
        _set(handleSubmitErrorAtom, {
          messageError: "Saída de campo do tipo RODÍZIO não pode ter dirigente."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar a saída de campo."
        })
      }
      throw err
    }
  }
)

export const updateFieldServiceAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, template_id: string, payload: UpdateFieldServicePayload) => {
    try {
      const res = await api.patch(`${API_ROUTES.FIELD_SERVICE_TEMPLATES}/${template_id}`, payload)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Saída de campo atualizada com sucesso!",
        redirectTo: "/congregacao/saidas-campo"
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Field service template not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Saída de campo não encontrada."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao atualizar a saída de campo."
        })
      }
      throw err
    }
  }
)

export const deleteFieldServiceAtom = atom(
  null,
  async (_get, _set, template_id: string) => {
    try {
      await api.delete(`${API_ROUTES.FIELD_SERVICE_TEMPLATES}/${template_id}`)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Saída de campo excluída com sucesso!",
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Field service template not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Saída de campo não encontrada."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir a saída de campo."
        })
      }
      throw err
    }
  }
)

//Field Service Schedules

export const generateFieldServiceAtom = atom(
  null,
  async (_get, _set, template_id: string, payload: GenerateFieldService) => {
    try {
      await api.post(`${API_ROUTES.FIELD_SERVICE_TEMPLATES}/${template_id}/generate-schedules`, payload)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Programação gerada com sucesso!",
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "startDate and endDate are required") {
        _set(handleSubmitErrorAtom, {
          messageError: "Datas de início e fim são obrigatórias."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao gerar a programação."
        })
      }
      throw err
    }
  }
)

// Field Service Exceptions 

export const createFieldServiceExceptionAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateFieldServiceExceptionPayload) => {
    try {
      const res = await api.post(`${API_ROUTES.FIELD_SERVICE_EXCEPTIONS}/congregation/${congregation_id}`, payload)

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Exceção adicionada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "date is required") {
        _set(handleSubmitErrorAtom, {
          messageError: "Data é obrigatória."
        })
      } else if (message === "Congregation not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Congregação não encontrada."
        })
      } else if (message === "Field service template not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Saída de campo não encontrada."
        })
      } else if (message.includes("already exists")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Já existe uma exceção para esta data."
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

export const deleteFieldServiceExceptionAtom = atom(
  null,
  async (_get, _set, exception_id: string) => {
    try {
      await api.delete(`${API_ROUTES.FIELD_SERVICE_EXCEPTIONS}/${exception_id}`)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Exceção excluída com sucesso!",
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Field service exception not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Exceção não encontrada."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir a exceção."
        })
      }
      throw err
    }
  }
)



