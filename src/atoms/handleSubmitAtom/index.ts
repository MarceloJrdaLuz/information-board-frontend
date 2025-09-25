import { atom } from "jotai"
import Router from "next/router"
import { toast } from "react-toastify"

// átomos de estado (já tinha no seu projeto)
export const buttonDisabledAtom = atom(false)
export const resetFormAtom = atom(false)
export const successFormSendAtom = atom(false)
export const errorFormSendAtom = atom(false)

// átomos de ação
export const handleSubmitErrorAtom = atom(
  null,
  (get, set, { messageError, redirectTo }: { messageError: string; redirectTo?: string }) => {
    toast.error(messageError, { autoClose: 3000 })
    set(buttonDisabledAtom, true)
    set(errorFormSendAtom, true)
    set(resetFormAtom, false)

    setTimeout(() => {
      set(buttonDisabledAtom, false)
      set(errorFormSendAtom, false)
      if (redirectTo) Router.push(redirectTo)
    }, 1000)
  }
)

export const handleSubmitSuccessAtom = atom(
  null,
  (get, set, { messageSuccess, redirectTo }: { messageSuccess: string; redirectTo?: string }) => {
    toast.success(messageSuccess, { autoClose: 3000 })
    set(successFormSendAtom, true)
    set(buttonDisabledAtom, true)
    set(resetFormAtom, true)

    setTimeout(() => {
      set(successFormSendAtom, false)
      set(errorFormSendAtom, false)
      set(buttonDisabledAtom, false)
      set(resetFormAtom, false)
      if (redirectTo) Router.push(redirectTo)
    }, 1000)
  }
)
