import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { CongregationContext } from "./CongregationContext"
import { ICongregation, INotice } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { useSubmitContext } from "./SubmitFormContext"

type NoticesContextTypes = {
    createNotice: (
        title: string,
        text: string,
        startDay?: number,
        endDay?: number
    ) => Promise<any>
    setExpiredNotice: React.Dispatch<Date>
    setCongregationNumber: React.Dispatch<string>
}

type NoticeContextProviderProps = {
    children: ReactNode
}

const NoticesContext = createContext({} as NoticesContextTypes)

function NoticesProvider(props: NoticeContextProviderProps) {

    const [expiredNotice, setExpiredNotice] = useState<Date>()

    const [congregationNumber, setCongregationNumber] = useState('')
    const [congregationId, setCongregationId] = useState<string | undefined>('')

    const fetchConfigCongregationData = congregationNumber ? `/congregation/${congregationNumber}` : ""
    const { data: congregation, mutate } = useFetch<ICongregation>(fetchConfigCongregationData)

    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    useEffect(() => {
        if (congregationNumber) {
            setCongregationId(congregation?.id)
        }
    }, [congregation, congregationNumber])


    async function createNotice(
        title: string,
        text: string,
        startDay?: number,
        endDay?: number
    ) {

        await api.post(`/notice/${congregationId}`, {
            title,
            text,
            startDay: startDay ?? null,
            endDay: endDay ?? null,
            expired: expiredNotice ?? null
        }).then(res => {
            toast.success('Anúncio criado com sucesso!')
            handleSubmitSuccess()
        }).catch(err => {
            console.log(err)
            handleSubmitError()
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
        })
    }

    return (
        <NoticesContext.Provider value={{
            createNotice, setExpiredNotice, setCongregationNumber
        }}>
            {props.children}
        </NoticesContext.Provider>
    )
}

function useNoticesContext(): NoticesContextTypes {
    const context = useContext(NoticesContext);

    if (!context) {
        throw new Error("useFiles must be used within FileProvider");
    }

    return context;
}

export { NoticesProvider, useNoticesContext };