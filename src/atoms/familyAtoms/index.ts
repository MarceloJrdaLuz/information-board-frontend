import { API_ROUTES } from "@/constants/apiRoutes"
import { api } from "@/services/api"
import { IHospitalityGroup } from "@/types/types"
import { atom } from "jotai"
import { handleSubmitErrorAtom, handleSubmitSuccessAtom } from "../handleSubmitAtom"
import { CreateFamilyPayload, UpdateFamilyPayload } from "./types"

export const createFamilyAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, congregation_id: string, payload: CreateFamilyPayload) => {
    try {
      const res = await api.post(`${API_ROUTES.FAMILIES}/congregation/${congregation_id}`, payload)

      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Família criada com sucesso!",
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Family name is required") {
        _set(handleSubmitErrorAtom, {
          messageError: "Nome da família é obrigatório."
        })
      } else if (message?.includes("already exists")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Já existe uma família com esse nome."
        })
      } else if (message?.includes("Congregation was not found")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Congregação não foi encontrada."
        })
      } else if (message === "One or more publishers already belong to another family") {
        _set(handleSubmitErrorAtom, {
          messageError: "Algum publicador já pertence a outra família."
        })
      } else if (message === "Responsible publisher not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Publicador responsável não encontrado."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar a família."
        })
      }
      throw err
    }
  }
)

export const updateFamilyAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, family_id: string, payload: UpdateFamilyPayload) => {
    try {
      const res = await api.patch(`${API_ROUTES.FAMILIES}/${family_id}`, payload)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Família atualizado com sucesso!",
        redirectTo: "/congregacao/familias"
      })
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Family not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Família não encontrada."
        })
      } else if (message?.includes("already exists")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Já existe uma família com esse nome."
        })
      } else if (message?.includes("Congregation was not found")) {
        _set(handleSubmitErrorAtom, {
          messageError: "Congregação não foi encontrada."
        })
      } else if (message === "One or more publishers already belong to another family") {
        _set(handleSubmitErrorAtom, {
          messageError: "Algum publicador já pertence a outra família."
        })
      } else if (message === "Responsible publisher not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Publicador responsável não encontrado."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao criar a família."
        })
      }
      throw err
    }
  }
)

export const deleteFamilyAtom = atom(
  null,
  async (_get, _set, family_id: string) => {
    try {
      await api.delete(`${API_ROUTES.FAMILIES}/${family_id}`)
      _set(handleSubmitSuccessAtom, {
        messageSuccess: "Família excluído com sucesso!",
      })
      return true
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Family not found") {
        _set(handleSubmitErrorAtom, {
          messageError: "Família não encontrado."
        })
      } else {
        console.error(err)
        _set(handleSubmitErrorAtom, {
          messageError: "Erro ao excluir a família."
        })
      }
      throw err
    }
  }
)

