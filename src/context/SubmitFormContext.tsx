import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { getCookie } from "cookies-next"
import { ConsentRecordTypes, IPublisherConsent } from "@/entities/types"
import Router from "next/router"
import { useAtom } from "jotai"
import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"

type SubmitFormContextTypes = {
    handleSubmitError: () => void
    handleSubmitSuccess: () => void
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


    const handleSubmitError = () => {
        setDisabled(true)
        setErrorFormSendValue(true)
        setResetFormValue(false)
        setTimeout(() => {
            setDisabled(false)
            setErrorFormSendValue(false)
        }, 6000)
    }

    const handleSubmitSuccess = async () => {
        setSuccessFormSendValue(true)
        setDisabled(true)
        setResetFormValue(true)
        setTimeout(() => {
            setSuccessFormSendValue(false)
            setErrorFormSendValue(false)
            setDisabled(false)
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