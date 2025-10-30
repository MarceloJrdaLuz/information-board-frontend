import { api } from "@/services/api"
import { atom } from "jotai"
import { toast } from "react-toastify"
import { CreateConsentCongregationPayload } from "./types"

export const createConsentCongregationAtom = atom(
  null, // valor inicial → write-only atom
  async (_get, _set, payload: CreateConsentCongregationPayload) => {
    try {
      const res = await api.post("/consent/accept", payload)
      toast.success("Consentimento dado com sucesso!")
      return res.data
    } catch (err: any) {
      const message = err?.response?.data?.message

      if (message === "Congregation was not found") {
        toast.error("Congregação não encontrada")
      } else {
        console.error(err)
        toast.error("Erro ao dar o consentimento")
      }
      throw err
    }
  }
)
