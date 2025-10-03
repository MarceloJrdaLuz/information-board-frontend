import { atomTerritoryHistoryAction, territoryHistoryToUpdate } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { CreateTerritoryArgs, CreateTerritoryHistoryArgs, DeleteTerritoryArgs, DeleteTerritoryHistoryArgs, ITerritory, ITerritoryHistory, UpdateTerritoryArgs, UpdateTerritoryHistoryArgs } from "@/types/territory"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { useAtom } from "jotai"
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { mutate } from "swr"
import { useAuthContext } from "./AuthContext"
import { useSubmitContext } from "./SubmitFormContext"

type TerritoryContextTypes = {
    setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>
    uploadedFile: File | null
    territoriesHistory: ITerritoryHistory[] | undefined
    territories: ITerritory[] | undefined
    createTerritory: (
        { name, description, number }: CreateTerritoryArgs
    ) => Promise<any>
    createTerritoryHistory: (
        { territory_id, assignment_date, caretaker, work_type, completion_date }: CreateTerritoryHistoryArgs
    ) => Promise<any>
    updateTerritoryHistory: (
        { assignment_date, caretaker, work_type, completion_date, territoryHistory_id }: UpdateTerritoryHistoryArgs
    ) => Promise<any>
    updateTerritory: (
        { name, number, territory_id, description }: UpdateTerritoryArgs
    ) => Promise<any>
    deleteTerritory: (
        { territory_id }: DeleteTerritoryArgs
    ) => Promise<any>
    deleteTerritoryHistory: (
        { territoryHistory_id, territory_id }: DeleteTerritoryHistoryArgs
    ) => Promise<any>
}

type TerritoryContextProviderProps = {
    children: ReactNode
}

const TerritoryContext = createContext({} as TerritoryContextTypes)

function TerritoryProvider(props: TerritoryContextProviderProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const { user } = useAuthContext()
    const [congregationId, setCongregationId] = useState<string | undefined>("")
    const [territoryHistoryAction, setTerritoryHistoryAction] = useAtom(atomTerritoryHistoryAction)
    const [territoryHistoryToUpdateId, setTerritoryHistoryToUpdateId] = useAtom(territoryHistoryToUpdate)
    const [territoriesHistory, setTerritoriesHistory] = useState<ITerritoryHistory[] | undefined>()
    const [territories, setTerritories] = useState<ITerritory[] | undefined>()
    const { data } = useFetch<ITerritoryHistory[]>(congregationId ? `/territoriesHistory/${congregationId}` : "")

    useEffect(() => {
        if (user?.congregation?.id) {
            setCongregationId(user.congregation.id);
        }
    }, [user])

    useEffect(() => {
        if (data) {
            setTerritoriesHistory(data);
        }
    }, [data])

    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    async function createTerritory(
        { name, number, description }: CreateTerritoryArgs
    ) {
        const congregation_id = congregationId
        const formData = new FormData()

        formData.set('name', name)
        formData.set('number', number.toString())
        description && formData.set('description', description)

        if (uploadedFile) {
            formData.set('territory_image', uploadedFile)
        }
        await api.post(`${API_ROUTES.TERRITORY}/${congregation_id}`, formData).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.territoryCreate)
            if (uploadedFile) {
                setUploadedFile(null)
            }
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    async function updateTerritory(
        { name, number, territory_id, description }: UpdateTerritoryArgs
    ) {
        const formData = new FormData()

        formData.set('name', name)
        formData.set('number', number.toString())
        description && formData.set('description', description)

        if (uploadedFile) {
            formData.set('territory_image', uploadedFile)
        }

        await api.put(`${API_ROUTES.TERRITORY}/${territory_id}`, formData
        ).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.territoryUpdate, '/congregacao/territorios')
            if (uploadedFile) {
                setUploadedFile(null)
            }
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

    const getTerritories = useCallback(async () => {
        if (!congregationId) return;

        try {
            const response = await api.get<ITerritory[]>(`/territories/${congregationId}`);
            setTerritories(response.data);
        } catch (err) {
            console.log(err);
        }
    }, [congregationId])

    useEffect(() => {
        getTerritories()
    }, [congregationId, getTerritories])

    async function deleteTerritory(
        { territory_id }: DeleteTerritoryArgs
    ) {
        const congregation_id = congregationId
        await api.delete(`${API_ROUTES.TERRITORY}/${territory_id}`).then(res => {
            mutate(`/territories/${congregation_id}`)
            handleSubmitSuccess(messageSuccessSubmit.territoryDelete)
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

    async function createTerritoryHistory(
        { territory_id, assignment_date, caretaker, work_type, completion_date }: CreateTerritoryHistoryArgs
    ) {
        await api.post(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`, {
            assignment_date,
            caretaker,
            work_type,
            completion_date
        }).then(res => {
            setTerritoryHistoryAction("")
            handleSubmitSuccess(messageSuccessSubmit.territoryHistoryCreate)
            if (uploadedFile) {
                setUploadedFile(null)
            }
            mutate(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    async function updateTerritoryHistory(
        { assignment_date, caretaker, territoryHistory_id, completion_date, work_type, territory_id }: UpdateTerritoryHistoryArgs
    ) {

        await api.put(`${API_ROUTES.TERRITORYHISTORY}/${territoryHistory_id}`, {
            assignment_date,
            caretaker,
            territoryHistory_id,
            completion_date,
            work_type
        }
        ).then(res => {
            setTerritoryHistoryAction("")
            setTerritoryHistoryToUpdateId("")
            handleSubmitSuccess(messageSuccessSubmit.territoryHistoryUpdate)
            if (uploadedFile) {
                setUploadedFile(null)
            }
            mutate(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === "The assignment date must be before or equal to the completion date") {
                handleSubmitError(messageErrorsSubmit.completionDate)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    async function deleteTerritoryHistory(
        { territoryHistory_id, territory_id }: DeleteTerritoryHistoryArgs
    ) {
        await api.delete(`${API_ROUTES.TERRITORYHISTORY}/${territoryHistory_id}`).then(res => {
            mutate(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`)
            handleSubmitSuccess(messageSuccessSubmit.territoryHistoryDelete)
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
        <TerritoryContext.Provider value={{
            createTerritory, updateTerritory, deleteTerritory, setUploadedFile, uploadedFile, createTerritoryHistory, updateTerritoryHistory, deleteTerritoryHistory, territoriesHistory, territories
        }}>
            {props.children}
        </TerritoryContext.Provider>
    )
}

function useTerritoryContext(): TerritoryContextTypes {
    const context = useContext(TerritoryContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context
}

export { TerritoryProvider, useTerritoryContext }
