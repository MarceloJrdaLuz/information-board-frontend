import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { getCookie } from "cookies-next"
import { ConsentRecordTypes, IPublisherConsent } from "@/entities/types"
import Router from "next/router"
import { useAtom } from "jotai"
import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"
import { useSubmitContext } from "./SubmitFormContext"

type PublisherContextTypes = {
    createPublisher: (
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date
    ) => Promise<any>
    updatePublisher: (
        id: string,
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date
    ) => Promise<any>
    genderCheckbox: string[],
    setGenderCheckbox: Dispatch<SetStateAction<string[]>>,
    createReport: (
        month: string,
        year: string,
        publisher: {
            fullName: string,
            nickName: string,
            congregation_id: string
        },
        publications: number,
        videos: number,
        hours: number,
        revisits: number,
        studies: number,
        observations: string
    ) => Promise<any>
    createConsentRecord: (publisher: IPublisherConsent, deviceId?: string) => void
}

type PublisherContextProviderProps = {
    children: ReactNode
}

const PublisherContext = createContext({} as PublisherContextTypes)

function PublisherProvider(props: PublisherContextProviderProps) {

    const [genderCheckbox, setGenderCheckbox] = useState<string[]>([])
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    async function createPublisher(
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date
    ) {

        await api.post('/publisher', {
            fullName,
            nickname,
            privileges,
            congregation_id,
            hope,
            gender,
            dateImmersed
        }).then(res => {
            toast.success('Publicador criado com sucesso!')
            handleSubmitSuccess()
        }).catch(err => {
            handleSubmitError()
            const { response: { data: { message } } } = err
            if (message === 'A nickname is required to differentiate the publisher') {
                toast.error('Outro publicador com o mesmo nome na congregação. Forneça um apelido para diferenciar!')
            } else {
                console.log(err)
                toast.error('Ocorreu um erro no servidor!')
            }
        })
    }

    async function updatePublisher(
        id: string,
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date
    ) {

        await api.put('/publisher', {
            id,
            fullName,
            congregation_id,
            gender,
            hope,
            privileges,
            nickname,
            dateImmersed
        }).then(res => {
            toast.success('Publicador atualizado com sucesso!')
            handleSubmitSuccess()
        }).catch(err => {
            console.log(err)
            handleSubmitError()
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
        })
    }

    async function createReport(
        month: string,
        year: string,
        publisher: {
            fullName: string,
            nickName: string,
            congregation_id: string
        },
        publications: number,
        videos: number,
        hours: number,
        revisits: number,
        studies: number,
        observations: string
    ) {

        await api.post('/report', {
            month,
            year,
            publisher,
            publications,
            videos,
            hours,
            revisits,
            studies,
            observations
        },).then(res => {
            handleSubmitSuccess()
            toast.success('Relatório enviado com sucesso!')
        }).catch(err => {
            console.log(err)
            handleSubmitError()
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
        })

    }

    async function createConsentRecord(publisher: IPublisherConsent, deviceId?: string) {

        console.log(deviceId)

        await api.post<ConsentRecordTypes>('/consentRecord', {
            publisher: {
                fullName: publisher.fullName,
                nickname: publisher.nickname,
                congregation_id: publisher.congregation_id,
            },
            deviceId
        }).then(suc => {
            const { data: { deviceId, publisher, consentDate } } = suc
            const storage = localStorage.getItem('publisher')

            let jsonSave = []

            if (storage) {
                const parse = JSON.parse(storage)

                jsonSave = [
                    ...parse,
                    {
                        ...publisher,
                        deviceId,
                        consentDate
                    }
                ]
            } else {
                jsonSave = [{
                    ...publisher,
                    deviceId,
                    consentDate
                }]
            }

            localStorage.setItem('publisher', JSON.stringify(jsonSave))
            localStorage.setItem('deviceId', deviceId)
            handleSubmitSuccess()
        }).catch(err => {
            handleSubmitError()
            console.log(err)
            toast.error('Ocorreu um erro no servidor!')
        })
    }

    return (
        <PublisherContext.Provider value={{
            createPublisher, updatePublisher, setGenderCheckbox, genderCheckbox, createReport, createConsentRecord
        }}>
            {props.children}
        </PublisherContext.Provider>
    )
}

function usePublisherContext(): PublisherContextTypes {
    const context = useContext(PublisherContext);

    if (!context) {
        throw new Error("useFiles must be used within FileProvider");
    }

    return context;
}

export { PublisherProvider, usePublisherContext, };