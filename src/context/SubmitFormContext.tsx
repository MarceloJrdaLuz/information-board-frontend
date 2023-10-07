import React, { createContext, ReactNode, useContext, useState } from "react"
import { useAtom } from "jotai"
import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"
import Router from "next/router"
import { toast } from "react-toastify"

type SubmitFormContextTypes = {
    handleSubmitError: (messageError: string, redirectTo?: string) => Promise<any>
    handleSubmitSuccess: (messageSuccess: string, redirectTo?: string) => Promise<any>
}

type SubmitFormContextProviderProps = {
    children: ReactNode
}

const SubmitFormContext = createContext({} as SubmitFormContextTypes)

function SubmitFormProvider(props: SubmitFormContextProviderProps) {

    const [genderCheckbox, setGenderCheckbox] = useState<string[]>([])
    const [, setDisabled] = useAtom(buttonDisabled)
    const [, setResetFormValue] = useAtom(resetForm)
    const [, setSuccessFormSendValue] = useAtom(successFormSend)
    const [, setErrorFormSendValue] = useAtom(errorFormSend)


    const handleSubmitError = async (messageError: string, redirectTo?: string) => {
        toast.error(messageError)
        setDisabled(true)
        setErrorFormSendValue(true)
        setResetFormValue(false)
        setTimeout(() => {
            setDisabled(false)
            setErrorFormSendValue(false)
            redirectTo && Router.push(redirectTo)
        }, 6000)
    }

    const handleSubmitSuccess = async ( messageSuccess: string, redirectTo?: string) => {
        toast.success(messageSuccess)
        setSuccessFormSendValue(true)
        setDisabled(true)
        setResetFormValue(true)
        setTimeout(() => {
            setSuccessFormSendValue(false)
            setErrorFormSendValue(false)
            setDisabled(false)
            setResetFormValue(false)
            redirectTo && Router.push(redirectTo)
        }, 6000)
    }


    return (
        <SubmitFormContext.Provider value={{
            handleSubmitError, handleSubmitSuccess
        }}>
            {props.children}
        </SubmitFormContext.Provider>
    )
}

function useSubmitContext(): SubmitFormContextTypes {
    const context = useContext(SubmitFormContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context;
}

export { useSubmitContext, SubmitFormProvider };