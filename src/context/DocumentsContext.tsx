import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/services/api";
import { AxiosError } from "axios";
import { ICongregation, IDocument, IFile } from "@/entities/types";
import Router from "next/router";
import { AuthContext } from "./AuthContext";
import { useFetch } from "@/hooks/useFetch";
import { v4 as uuidv4 } from "uuid";
import { filesize } from "filesize";
import { formatSize } from "@/functions/formatSize";


type DocumentsContextTypes = {
    uploadedFiles: IFile[]
    handleUpload(file: any): void;
    filterCategory: (category: string) => IDocument[]
    deleteDocument: (document_id: string) => Promise<any>
    setDocumentCategoryId: React.Dispatch<string>
}

type DocumentsContextProviderProps = {
    children: ReactNode
}

export const DocumentsContext = createContext({} as DocumentsContextTypes)

export function DocumentsProvider(props: DocumentsContextProviderProps) {

    const { user } = useContext(AuthContext)
    const congregationUser = user?.congregation
    const congregation_id = congregationUser?.id as string
    const { data, mutate } = useFetch<IDocument[]>(`/documents-congregation/${congregation_id}`)

    const [documents, setDocuments] = useState<IDocument[] | undefined>([])
    const [documentCategoryId, setDocumentCategoryId] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState<IFile[]>([])

    useEffect(() => {
        if (data) {
            const postFormatted: IFile[] = data.map((document) =>  {
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
        }
    }, [data, documentCategoryId])

    const updateFile = useCallback((id: any, data: any) => {
        setUploadedFiles((state) =>
            state.map((file) => (file.id === id ? { ...file, ...data } : file))
        );
    }, []);

    const processUpload = useCallback(
        (uploadedFile: IFile) => {
            const data = new FormData();
            if (uploadedFile.file) {
                data.append("file", uploadedFile.file, uploadedFile.name);
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
                        const loaded = progressEvent.loaded;
                        const total = progressEvent.total;
                        if (total) {
                            const progress: number = Math.round((loaded * 100) / total)
                            updateFile(uploadedFile.id, { progress });
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
                    );
                    console.log(err);

                    updateFile(uploadedFile.id, {
                        error: true,
                    });
                });
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
            }));

            // concat é mais performático que ...spread
            // https://www.malgol.com/how-to-merge-two-arrays-in-javascript/
            setUploadedFiles((state) => state.concat(newUploadedFiles))
            // Concatenar os novos arquivos carregados ao estado de documentos
            newUploadedFiles.forEach(processUpload);

        },
        [processUpload]
    )



    function filterCategory(category: string) {
        if (documents) {
            const documentsFiltered = documents.filter(document => document.category.name === category)
            return documentsFiltered
        }
        return []
    }

    async function deleteDocument(document_id: string) {
        await api.delete(`/document/${document_id}`).then(res => {
            mutate()
            toast.success('Documento exluído com sucesso!')
        }).catch(err => {
            toast.error('Ocorreu algum erro ao excluir o arquivo')
            console.log(err)
        })
    }

    return (
        <DocumentsContext.Provider value={{
            filterCategory, deleteDocument, handleUpload, uploadedFiles, setDocumentCategoryId
        }}>
            {props.children}
        </DocumentsContext.Provider>
    )
}