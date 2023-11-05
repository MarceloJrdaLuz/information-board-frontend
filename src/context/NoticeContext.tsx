import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { api } from "@/services/api"
import { ICongregation, INotice } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { useSubmitContext } from "./SubmitFormContext"
import { KeyedMutator } from "swr"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"

type NoticesContextTypes = {
    createNotice: (
        title: string,
        text: string,
        startDay?: number,
        endDay?: number
    ) => Promise<any>
    updateNotice: (
        notice_id: string,
        title: string,
        text: string,
        startDay?: number,
        endDay?: number
    ) => Promise<any>
    deleteNotice: (
        notice_id: string,
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
        endDay?: number,
    ) {

        await api.post(`/notice/${congregationId}`, {
            title,
            text,
            startDay: startDay ?? null,
            endDay: endDay ?? null,
            expired: expiredNotice ?? null
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.noticeCreate)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    async function updateNotice(
        notice_id: string,
        title?: string,
        text?: string,
        startDay?: number,
        endDay?: number
    ) {

        await api.put(`/notice/${notice_id}`, {
            title,
            text,
            startDay: startDay ?? null,
            endDay: endDay ?? null,
            expired: expiredNotice ?? null
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.noticeUpdate, '/anuncios')
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(err)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    async function deleteNotice(
        notice_id: string
    ) {

        await api.delete(`/notice/${notice_id}`).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.noticeDelete)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(err)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }



    return (
        <NoticesContext.Provider value={{
            createNotice, setExpiredNotice, setCongregationNumber, updateNotice, deleteNotice
        }}>
            {props.children}
        </NoticesContext.Provider>
    )
}

function useNoticesContext(): NoticesContextTypes {
    const context = useContext(NoticesContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context
}

export { NoticesProvider, useNoticesContext }