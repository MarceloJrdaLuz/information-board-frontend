import { showConfirmForceModal, showModalEmergencyContact } from "@/atoms/atom"
import { api } from "@/services/api"
import { IConsentRecordTypes } from "@/types/consent"
import { IPayloadCreatePublisher, IPayloadUpdatePublisher } from "@/types/publishers"
import { IPayloadCreateReport, IPayloadCreateReportManually } from "@/types/reports"
import { ILinkPublisherToUser, ITransferPublishers, IUnlinkPublisherToUser } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { useAtom, useSetAtom } from "jotai"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react"
import { toast } from "react-toastify"
import { useSubmitContext } from "./SubmitFormContext"


type PublisherContextTypes = {
    createPublisher: ({
        congregation_id,
        fullName,
        gender,
        address,
        birthDate,
        dateImmersed,
        emergencyContact_id,
        hope,
        nickname,
        phone,
        pioneerMonths,
        privileges,
        situation,
        startPioneer
    }: IPayloadCreatePublisher) => Promise<any>
    linkPublisherToUser: ({
        user_id,
        publisher_id,
        force
    }: ILinkPublisherToUser) => Promise<any>
    unlinkPublisherToUser: ({
        publisher_id
    }: IUnlinkPublisherToUser) => Promise<any>
    updatePublisher: (
        publisher_id: string,
        payload: IPayloadUpdatePublisher
    ) => Promise<any>
    transferPublishers: ({
        publisherIds,
        newCongregationId
    }: ITransferPublishers) => Promise<any>
    genderCheckbox: string[],
    setGenderCheckbox: Dispatch<SetStateAction<string[]>>,
    createReport: ({ hours, month, observations, publisher_id, studies, year }: IPayloadCreateReport) => Promise<any>
    createReportManually: ({ hours, month, observations, publisher, studies, year }: IPayloadCreateReportManually) => Promise<any>
    createConsentRecord: (publisher_id: string, deviceId?: string) => Promise<any>
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
    const [modalLinkForce, setModalLinkForce] = useAtom(showConfirmForceModal)


    async function createPublisher({
        congregation_id,
        fullName,
        gender,
        address,
        birthDate,
        dateImmersed,
        emergencyContact_id,
        hope,
        nickname,
        phone,
        pioneerMonths,
        privileges,
        situation,
        startPioneer
    }: IPayloadCreatePublisher) {
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
        publisher_id: string,
        payload: IPayloadUpdatePublisher
    ) {
        await api.put(`/publisher/${publisher_id}`, payload).then(res => {
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

    async function createReport({
        publisher_id,
        hours,
        month,
        observations,
        studies,
        year
    }: IPayloadCreateReport) {

        await api.post('/report', {
            month,
            year,
            publisher_id,
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

    async function createReportManually({
        hours,
        month,
        observations,
        publisher,
        studies,
        year
    }: IPayloadCreateReportManually) {
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

    async function createConsentRecord(publisher_id: string, deviceId?: string) {
        await api.post<IConsentRecordTypes>('/consent/accept', {
            publisher_id,
            deviceId,
            type: "publisher"
        }).then(suc => {
            const { data: { deviceId, publisher, accepted_at } } = suc
            const storage = localStorage.getItem('publisher')

            let jsonSave = []

            if (storage) {
                const parse = JSON.parse(storage)
                const filtered = parse.filter((p: any) => p.id !== publisher.id)

                jsonSave = [
                    ...filtered,
                    {
                        ...publisher,
                        deviceId,
                        accepted_at
                    }
                ]
            } else {
                jsonSave = [{
                    ...publisher,
                    deviceId,
                    accepted_at
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

    async function linkPublisherToUser(
        { user_id, publisher_id, force }: ILinkPublisherToUser
    ) {
        await api.patch(`/users/${user_id}/link-publisher`, {
            publisher_id,
            force
        }).then(res => {
            setModalLinkForce(false)
            handleSubmitSuccess(messageSuccessSubmit.linkPublisherToUserSuccess)
        }).catch(err => {
            if (err.response && err.response.status === 409) {
                if (err.response.data.message === "User and Publisher are already linked.") {
                    setModalLinkForce(false)
                    toast.success("Usuário e publicador já vinculados.")
                    return
                } else {
                    setModalLinkForce(true)
                    toast.error("Ocorreu algum conflito, confirmar a substituição!")
                    return
                }
            }
            console.log(err)
            toast.error(messageErrorsSubmit.default)
            return
        })
    }

    async function unlinkPublisherToUser({ publisher_id }: IUnlinkPublisherToUser) {
        await api.patch(`/publisher/${publisher_id}/unlink-publisher`).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.unLinkPublisherToUserSuccess)
        }).catch(err => {
            console.log(err)
            toast.error(messageErrorsSubmit.default)
        })
    }

    async function transferPublishers({ publisherIds, newCongregationId }: ITransferPublishers) {
        await api.put(`/publishers/transfer-congregation`, {
            publisherIds,
            newCongregationId
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.transferPublisherSuccess, '/congregacao/publicadores')
        }).catch(err => {
            console.log(err)
            toast.error(messageErrorsSubmit.default)
        })
    }

    return (
        <PublisherContext.Provider value={{
            createPublisher, updatePublisher, setGenderCheckbox, genderCheckbox, createReport, createConsentRecord, deletePublisher, createReportManually, deleteReport, linkPublisherToUser, unlinkPublisherToUser, transferPublishers
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

