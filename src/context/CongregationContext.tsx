import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { ICongregation } from "@/entities/types"
import Router, { useRouter } from "next/router"
import { AuthContext } from "./AuthContext"
import { useFetch } from "@/hooks/useFetch"

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

export const CongregationContext = createContext({} as CongregationContextTypes)

export function CongregationProvider(props: CongregationContextProviderProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [congregationCreated, setCongregationCreated] = useState<ICongregation>()
    const [showCongregationCreated, setShowCongregationCreated] = useState(false)
    const [modalNewCongregation, setModalNewCongregation] = useState(false)
    const [congregation, setCongregation] = useState<ICongregation>()

    const { user } = useContext(AuthContext)
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
            toast.success('Congregação criada com sucesso!')
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            if (message === 'Congregation already exists') {
                toast.error('Congregação já existe')
            } else {
                toast.error('Ocorreu um erro no servidor!')
            }
        })
    }

    async function updateCongregation(body: ICongregation) {

        const congregation_id = body.id

        await api.put(`/congregation/${congregation_id}`, body).then(suc => {
            mutate()
            toast.success('Congregação atualizada com sucesso!')
        }).catch(res => {
            if(res.response.data.message === "Any changes found"){
                return           
            }
            toast.error("Houve algum problema ao atualizar a congregação!")
            console.log(res)
        })

        const formData = new FormData()

        if (uploadedFile) {

            formData.set('image', uploadedFile)

            await api.put(`/congregation/${congregation_id}/photo`, formData).then(suc => {
                mutate()
                toast.success('Foto da congregação atualizada com sucesso!')
                setUploadedFile(null)
                Router.push('/dashboard')
            }).catch(err => {
                toast.error("Houve algum problema ao atualizar a congregação!")
                console.log(err)
            })
        }
    }

    async function addDomain(userCode: string, congregationNumber: string) {
        await api.post('/add-domain', {
            user_code: userCode,
            congregation_number: congregationNumber
        })
            .then(res => toast.success(`Usuário atribuído ao domínio!`))
            .catch(err => {
                const { response: { data: { message } } } = err
                if (message === "User code not exists") toast.error('Código de usuário não existe!')
                else console.log(err)
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