import { showModalEmergencyContact } from "@/atoms/atom"
import { ConsentRecordTypes, IEmergencyContact, IPublisherConsent } from "@/entities/types"
import { api } from "@/services/api"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { useSetAtom } from "jotai"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react"
import { toast } from "react-toastify"
import { useSubmitContext } from "./SubmitFormContext"

type PublisherContextTypes = {
    createPublisher: (
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date,
        birthDate?: Date,
        pioneerMonths?: string[],
        situation?: string,
        startPioneer?: Date,
        address?: string,
        phone?: string,
        emergencyContact_id?: string | undefined
    ) => Promise<any>
    createEmergencyContact: ({
        name,
        phone,
        relationship,
        isTj,
        congregation_id
    }: Omit<IEmergencyContact, 'id'> & { congregation_id: string }) => Promise<any>
    updatePublisher: (
        id: string,
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date,
        birthDate?: Date,
        pioneerMonths?: string[],
        situation?: string,
        startPioneer?: Date,
        address?: string,
        phone?: string,
        emergencyContact_id?: string | undefined
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
            congregation_number: string
        },
        hours: number,
        studies: number,
        observations: string
    ) => Promise<any>
    createReportManually: (
        month: string,
        year: string,
        publisher: {
            fullName: string,
            nickName: string,
            privileges: string[]
            congregation_id: string
        },
        hours: number,
        studies: number,
        observations: string
    ) => Promise<any>
    createConsentRecord: (publisher: IPublisherConsent, deviceId?: string) => Promise<any>
    deletePublisher: (publisher_id: string) => Promise<any>
    deleteReport: (report_id: string) => Promise<any>
}

type PublisherContextProviderProps = {
    children: ReactNode
}

const PublisherContext = createContext({} as PublisherContextTypes)

function PublisherProvider(props: PublisherContextProviderProps) {

    const [genderCheckbox, setGenderCheckbox] = useState<string[]>([])
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()
    const modal = useSetAtom(showModalEmergencyContact)


    async function createPublisher(
        fullName: string,
        congregation_id: string,
        gender: string,
        hope?: string,
        privileges?: string[],
        nickname?: string,
        dateImmersed?: Date,
        birthDate?: Date,
        pioneerMonths?: string[],
        situation?: string,
        startPioneer?: Date,
        address?: string,
        phone?: string,
        emergencyContact_id?: string
    ) {
        console.log(emergencyContact_id)

        await api.post('/publisher', {
            fullName,
            nickname,
            privileges,
            congregation_id,
            hope,
            gender,
            dateImmersed,
            birthDate,
            pioneerMonths,
            situation,
            startPioneer,
            address,
            phone,
            emergencyContact_id
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.publisherCreate)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === 'A nickname is required to differentiate the publisher') {
                handleSubmitError(messageErrorsSubmit.publisherNameAlreadyExists)
            } else {
                console.log(err)
                toast.error(messageErrorsSubmit.default)
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
        dateImmersed?: Date,
        birthDate?: Date,
        pioneerMonths?: string[],
        situation?: string,
        startPioneer?: Date,
        address?: string,
        phone?: string,
        emergencyContact_id?: string
    ) {
        await api.put(`/publisher/${id}`, {
            fullName,
            congregation_id,
            gender,
            hope,
            privileges,
            nickname,
            dateImmersed,
            birthDate,
            pioneerMonths,
            situation,
            startPioneer,
            address,
            phone,
            emergencyContact_id
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.publisherUpdate, '/congregacao/publicadores')
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

    async function createReport(
        month: string,
        year: string,
        publisher: {
            fullName: string,
            nickName: string,
            congregation_id: string
        },
        hours: number,
        studies: number,
        observations: string
    ) {

        await api.post('/report', {
            month,
            year,
            publisher,
            hours,
            studies,
            observations
        },).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.reportSend)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })

    }

    async function createReportManually(
        month: string,
        year: string,
        publisher: {
            fullName: string,
            nickName: string,
            privileges: string[]
            congregation_id: string
        },
        hours: number,
        studies: number,
        observations: string
    ) {

        await api.post('/reportManually', {
            month,
            year,
            publisher,
            hours,
            studies,
            observations
        },).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.reportSend)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })

    }

    async function createConsentRecord(publisher: IPublisherConsent, deviceId?: string) {

        await api.post<ConsentRecordTypes>('/consentRecord', {
            publisher: {
                fullName: publisher.fullName,
                nickname: publisher.nickname,
                congregation_id: publisher.congregation_id,
                congregation_number: publisher.congregation_number
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
            handleSubmitSuccess(messageSuccessSubmit.consentCreate)
        }).catch(err => {
            console.log(err)
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    async function deletePublisher(publisher_id: string) {
        api.delete(`/publisher/${publisher_id}`).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.publisherDelete)
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

    async function deleteReport(report_id: string) {
        api.delete(`/report/${report_id}`).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.reportDelete)
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

    async function createEmergencyContact(
        { name, phone, relationship, isTj, congregation_id }: Omit<IEmergencyContact, 'id'> & { congregation_id: string }
    ) {
        console.log({ name, phone, relationship, isTj, congregation_id })
        await api.post('/emergencyContact', {
            name,
            phone,
            relationship,
            isTj,
            congregation_id
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.emergencyContactCreate)
            modal(false)
        }).catch(err => {
            console.log(err)
            toast.error(messageErrorsSubmit.default)
        })
    }

    return (
        <PublisherContext.Provider value={{
            createPublisher, updatePublisher, setGenderCheckbox, genderCheckbox, createReport, createConsentRecord, deletePublisher, createReportManually, deleteReport, createEmergencyContact
        }}>
            {props.children}
        </PublisherContext.Provider>
    )
}

function usePublisherContext(): PublisherContextTypes {
    const context = useContext(PublisherContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context
}

export { PublisherProvider, usePublisherContext }
