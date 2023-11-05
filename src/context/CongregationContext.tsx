import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { ICongregation } from "@/entities/types"
import Router, { useRouter } from "next/router"
import { useAuthContext } from "./AuthContext"
import { useFetch } from "@/hooks/useFetch"
import { useSubmitContext } from "./SubmitFormContext"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"

type CongregationContextTypes = {
    createCongregation: (name: string, number: string, circuit: string, city: string) => Promise<any>
    updateCongregation: (body: ICongregation) => Promise<any>
    uploadedFile: File | null
    setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>
    congregationCreated: ICongregation | undefined
    setCongregationCreated: React.Dispatch<ICongregation>
    setShowCongregationCreated: React.Dispatch<boolean>
    showCongregationCreated: boolean
    setModalNewCongregation: React.Dispatch<boolean>
    modalNewCongregation: boolean
    addDomain: (userCode: string, congregationNumber: string) => Promise<any>
    congregation: ICongregation | undefined
}

type CongregationContextProviderProps = {
    children: ReactNode
}

export type FormCongregation = {
    name: string,
    number: string,
    circuit: string,
    city: string,
}

const CongregationContext = createContext({} as CongregationContextTypes)

function CongregationProvider(props: CongregationContextProviderProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [congregationCreated, setCongregationCreated] = useState<ICongregation>()
    const [showCongregationCreated, setShowCongregationCreated] = useState(false)
    const [modalNewCongregation, setModalNewCongregation] = useState(false)
    const [congregation, setCongregation] = useState<ICongregation>()

    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const { user } = useAuthContext()
    const number = user?.congregation?.number

    const fetchConfig = number ? `/congregation/${number}` : ""
    const { data, mutate } = useFetch(fetchConfig)

    useEffect(() => {
        if (number) {
            setCongregation(data)
        }
    }, [data, number])

    useEffect(() => {
        setCongregation(data)
    }, [data, congregation])

    async function createCongregation(name: string, number: string, circuit: string, city: string) {
        const formData = new FormData()

        formData.set('name', name)
        formData.set('number', number)
        formData.set('circuit', circuit)
        formData.set('city', city)

        if (uploadedFile) {
            formData.set('image', uploadedFile)
        }

        await api.post('/congregation',
            formData
        ).then(res => {
            setCongregationCreated(res.data)
            setShowCongregationCreated(true)
            setUploadedFile(null)
            handleSubmitSuccess(messageSuccessSubmit.congregationCreate)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            if (message === 'Congregation already exists') {
                handleSubmitError(messageErrorsSubmit.congregationAlreadyExists)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    async function updateCongregation(body: ICongregation) {

        const congregation_id = body.id

        await api.put(`/congregation/${congregation_id}`, body).then(suc => {
            mutate()
            handleSubmitSuccess(messageSuccessSubmit.congregationUpdate)
        }).catch(res => {
            if (res.response.data.message === "Any changes found") {
                return
            }
            console.log(res)
            handleSubmitError(messageErrorsSubmit.default)
        })

        const formData = new FormData()

        if (uploadedFile) {

            formData.set('image', uploadedFile)

            await api.put(`/congregation/${congregation_id}/photo`, formData).then(suc => {
                mutate()
                setUploadedFile(null)
                handleSubmitSuccess(messageSuccessSubmit.congregationPhotoUpdate, '/dashboard')
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
    }

    async function addDomain(userCode: string, congregationNumber: string) {
        await api.post('/add-domain', {
            user_code: userCode,
            congregation_number: congregationNumber
        })
            .then(res => {
                handleSubmitSuccess(messageSuccessSubmit.userAddDomain)
            })
            .catch(err => {
                const { response: { data: { message } } } = err
                if (message === "User code not exists") {
                    handleSubmitError(messageErrorsSubmit.userCodeNotFound)
                    return
                }
                if (message === "Congregation not exists") {
                    handleSubmitError(messageErrorsSubmit.congregationNotFound)
                }
                else {
                    console.log(err)
                    handleSubmitError(messageErrorsSubmit.default)
                }
            })
    }

    return (
        <CongregationContext.Provider value={{
            createCongregation, setUploadedFile, uploadedFile, setCongregationCreated,
            congregationCreated, showCongregationCreated, setShowCongregationCreated,
            modalNewCongregation, setModalNewCongregation, addDomain, updateCongregation, congregation
        }}>
            {props.children}
        </CongregationContext.Provider>
    )
}

function useCongregationContext(): CongregationContextTypes {
    const context = useContext(CongregationContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context
}

export { CongregationProvider, useCongregationContext }