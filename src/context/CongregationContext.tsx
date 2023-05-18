import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/services/api";
import { AxiosError } from "axios";
import { ICongregation } from "@/entities/types";
import Router from "next/router";

type CongregationContextTypes = {
    createCongregation: (name: string, number: string, circuit: string, city: string) => Promise<any>
    updateCongregation:(body: ICongregation) => Promise<any>
    uploadedFile: File | null
    setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>
    congregationCreated: ICongregation | undefined
    setCongregationCreated: React.Dispatch<ICongregation>
    setShowCongregationCreated: React.Dispatch<boolean>
    showCongregationCreated: boolean
    setModalNewCongregation: React.Dispatch<boolean>
    modalNewCongregation: boolean
    addDomain: (userCode: string, congregationNumber: string) => Promise<any>
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

    async function updateCongregation(body: ICongregation){
        await api.put('/congregation', {
           ...body
        }).then(suc => {
            toast.success('Congregação atualizada com sucesso!')
            Router.push('/dashboard')
        }).catch(err => {
            toast.error("Houve algum problema ao atualizar a congregação!")
            console.log(err)
        })
    }

    async function addDomain(userCode: string, congregationNumber: string) {
        await api.post('/add-domain', {
            user_code: userCode,
            congregation_number: congregationNumber
        })
            .then(res => toast.success(`${res.data.message}`))
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
            modalNewCongregation, setModalNewCongregation, addDomain, updateCongregation
        }}>
            {props.children}
        </CongregationContext.Provider>
    )
}