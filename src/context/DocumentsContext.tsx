import { useFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IDocument, IFile } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { filesize } from "filesize"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useCongregationContext } from "./CongregationContext"

type DocumentsContextTypes = {
    uploadedFiles: IFile[]
    handleUpload(file: any): void
    filterCategory: (category: string) => IFile[]
    deleteDocument: (document_id: string) => Promise<any>
    setDocumentCategoryId: React.Dispatch<string>
    loading: boolean
}

type DocumentsContextProviderProps = {
    children: ReactNode
}

const DocumentsContext = createContext({} as DocumentsContextTypes)

function DocumentsProvider(props: DocumentsContextProviderProps) {

    const { congregation: congregationUser } = useCongregationContext()
    const congregation_id = congregationUser?.id
    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const [documentCategoryId, setDocumentCategoryId] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState<IFile[]>([])
    const [loading, setLoading] = useState(true)

    const fetchConfig = congregation_id ? `/documents-congregation/${congregation_id}` : ""
    const { data, mutate } = useFetch<IDocument[]>(fetchConfig)

    useEffect(() => {
        if (data) {
            const postFormatted: IFile[] = data.map((document) => {
                return {
                    ...document,
                    id: document.id,
                    name: document.fileName,
                    preview: document.url,
                    readableSize: filesize(Number(document.size)).toString(),
                    file: null,
                    error: false,
                    uploaded: true,
                }
            })

            const filterDocumentsCategory = postFormatted.filter(file => file.category?.id === documentCategoryId)

            setUploadedFiles(filterDocumentsCategory)
            setLoading(false)
        }
    }, [data, documentCategoryId])

    const updateFile = useCallback((id: any, data: any) => {
        setUploadedFiles((state) =>
            state.map((file) => (file.id === id ? { ...file, ...data } : file))
        )
    }, [])

    const processUpload = useCallback(
        (uploadedFile: IFile) => {
            const data = new FormData()

            if (uploadedFile.file) {
                data.append("file", uploadedFile.file, uploadedFile.name)
            }

            if (congregation_id) {
                data.append("congregation_id", congregation_id)
            }

            if (documentCategoryId) {
                data.append("category_id", documentCategoryId)
            }

            api
                .post("/new-document", data, {
                    onUploadProgress: (progressEvent) => {
                        const loaded = progressEvent.loaded
                        const total = progressEvent.total
                        if (total) {
                            const progress: number = Math.round((loaded * 100) / total)
                            updateFile(uploadedFile.id, { progress })
                        }
                    },
                })
                .then((response) => {
                    updateFile(uploadedFile.id, {
                        uploaded: true,
                        id: response.data.id,
                        url: response.data.url,
                    })

                    setUploadedFiles([])

                    mutate()
                })
                .catch((err) => {
                    console.error(
                        `Houve um problema para fazer upload ${uploadedFile.name} no servidor`
                    )
                    console.log(err)

                    updateFile(uploadedFile.id, {
                        error: true,
                    })
                })
        },
        [updateFile, documentCategoryId, congregation_id, mutate]
    )

    const handleUpload = useCallback(
        (files: File[]) => {
            const newUploadedFiles: IFile[] = files.map((file: File) => ({
                file,
                id: uuidv4(),
                name: file.name,
                readableSize: filesize(file.size).toString(),
                preview: URL.createObjectURL(file),
                progress: 0,
                uploaded: false,
                error: false,
                url: "",
            }))

            // concat é mais performático que ...spread
            // https://www.malgol.com/how-to-merge-two-arrays-in-javascript/
            setUploadedFiles((state) => state.concat(newUploadedFiles))
            // Concatenar os novos arquivos carregados ao estado de documentos
            newUploadedFiles.forEach(processUpload)

        },
        [processUpload]
    )

    function filterCategory(category: string) {
        if (uploadedFiles) {
            const documentsFiltered = uploadedFiles.filter(document => document.category?.name === category)
            return documentsFiltered
        }
        return []
    }

    async function deleteDocument(document_id: string) {
        await api.delete(`/document/${document_id}`).then(res => {
            mutate()
            handleSubmitSuccess(messageSuccessSubmit.documentCreate)
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
        <DocumentsContext.Provider value={{
            filterCategory, deleteDocument, handleUpload, uploadedFiles, setDocumentCategoryId, loading
        }}>
            {props.children}
        </DocumentsContext.Provider>
    )
}

function useDocumentsContext(): DocumentsContextTypes {
    const context = useContext(DocumentsContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context
}

export { DocumentsProvider, useDocumentsContext }

