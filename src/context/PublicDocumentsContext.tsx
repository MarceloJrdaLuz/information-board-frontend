import { ICongregation, IDocument } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { createContext, ReactNode, useEffect, useState } from "react"


type PublicDocumentsContextTypes = {
    setCongregationNumber: React.Dispatch<string>
    documents: IDocument[] | undefined
    filterDocuments: (category: string) => IDocument[] | undefined
}

type PublicDocumentsContextProviderProps = {
    children: ReactNode
}

export const PublicDocumentsContext = createContext({} as PublicDocumentsContextTypes)

export function PublicDocumentsProvider(props: PublicDocumentsContextProviderProps) {

    const [congregationNumber, setCongregationNumber] = useState('')
    const [congregationId, setCongregationId] = useState<string | undefined>('')
    const [documents, setDocuments] = useState<IDocument[]>()

    const fetchConfigCongregationData = congregationNumber ? `/congregation/${congregationNumber}` : ""
    const { data: congregation, mutate } = useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregationNumber) {
            setCongregationId(congregation?.id)
        }
    }, [congregation, congregationNumber])

    const fetchConfigDocumentsData = congregationId ? `/documents-congregation/${congregationId}` : ""
    const { data: documentsData } = useFetch<IDocument[]>(fetchConfigDocumentsData)

    useEffect(() => {
        setDocuments(documentsData)
    }, [documentsData, documents])

    function filterDocuments(category: string){
        if (documents) {
            const documentsFiltered = documents.filter(document => document.category.name === category)
            return documentsFiltered
        }
        return []
    }


    return (
        <PublicDocumentsContext.Provider value={{
            setCongregationNumber, documents, filterDocuments
        }}>
            {props.children}
        </PublicDocumentsContext.Provider>
    )
}