import React, { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/services/api";
import { Gender, Hope } from "@/entities/types";

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

}

type PublisherContextProviderProps = {
    children: ReactNode
}

export const PublisherContext = createContext({} as PublisherContextTypes)

export function PublisherProvider(props: PublisherContextProviderProps) {

    const [genderCheckbox, setGenderCheckbox] = useState<string[]>([]);


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
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
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
        }).catch(err => {
            console.log(err)
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
        }).then(res => {
            toast.success('Relatório enviado com sucesso!')
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
        })
    }


    return (
        <PublisherContext.Provider value={{
            createPublisher, updatePublisher, setGenderCheckbox, genderCheckbox, createReport
        }}>
            {props.children}
        </PublisherContext.Provider>
    )
}