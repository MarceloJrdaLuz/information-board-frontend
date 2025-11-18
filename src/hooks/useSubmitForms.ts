import { useAtom } from "jotai"
import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"
import Router from "next/router"
import { toast } from "react-toastify"

export function useSubmit() {
  const [, setDisabled] = useAtom(buttonDisabled)
  const [, setResetFormValue] = useAtom(resetForm)
  const [, setSuccessFormSendValue] = useAtom(successFormSend)
  const [, setErrorFormSendValue] = useAtom(errorFormSend)

  const handleSubmitError = async (messageError: string, redirectTo?: string) => {
    toast.error(messageError, { autoClose: 3000 })
    setDisabled(true)
    setErrorFormSendValue(true)
    setResetFormValue(false)

    setTimeout(() => {
      setDisabled(false)
      setErrorFormSendValue(false)
      redirectTo && Router.push(redirectTo)
    }, 1000)
  }

  const handleSubmitSuccess = async (messageSuccess: string, redirectTo?: string) => {
    toast.success(messageSuccess, { autoClose: 3000 })
    setSuccessFormSendValue(true)
    setDisabled(true)
    setResetFormValue(true)

    setTimeout(() => {
      setSuccessFormSendValue(false)
      setErrorFormSendValue(false)
      setDisabled(false)
      setResetFormValue(false)
      redirectTo && Router.push(redirectTo)
    }, 1000)
  }

  return { handleSubmitError, handleSubmitSuccess }
}
