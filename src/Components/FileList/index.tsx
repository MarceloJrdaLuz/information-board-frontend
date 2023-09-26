import { IFileListProps } from "./types"
import { useContext, useState } from "react"
import { Link2Icon, Trash2Icon, CheckIcon, XIcon, AlertTriangleIcon, AlertCircleIcon } from 'lucide-react'
import Link from "next/link"
import { useDocumentsContext } from "@/context/DocumentsContext"

export default function FileList({ files }: IFileListProps) {

    const [confirmDeleteItem, setConfirmDeleteItem] = useState<string | null>(null)

    const { deleteDocument, uploadedFiles } = useDocumentsContext()

    const renderConfirmMessage = (document_id: string) => {
        return (
            <div className="flex flex-wrap sm:flex-nowrap gap-5 items-center p-4  rounded-md ">
                <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-red-400"><AlertTriangleIcon /></span>
                    <span className=" text-red-400 font-semibold">Tem certeza que deseja excluir?</span>
                </div>

                <button
                    className="w-fit h-fit  text-success-100 hover:text-white bg-transparent
                                border-2 hover:bg-success-100 rounded-full border-success-100 "
                    onClick={() => handleDelete(document_id)}
                >
                    <CheckIcon />
                </button>
                <button className="w-fit h-fit  rounded-full border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white" onClick={() => setConfirmDeleteItem(null)}>
                    <XIcon />
                </button>
            </div>
        )
    }

    const handleDelete = (document_id: string) => {
        deleteDocument(document_id)
        setConfirmDeleteItem(null)
    }

    return (
        <ul className="flex flex-col w-11/12 md:w-9/12 m-auto  justify-between items-center  cursor-pointer">
            {files?.map(file => (
                <li key={file.id} className="flex bg-white hover:bg-sky-100  mb-2 shadow-lg w-full border border-gray-300 justify-between items-center p-6">
                    <div className="flex flex-col gap-3 justify-between">
                        <span className="font-bold text-black" >{file.name}</span>
                        <span className="text-xs text-gray-500 " >{file.readableSize}</span>
                    </div>
                    {confirmDeleteItem === file.id ? (
                        renderConfirmMessage(file.id)
                    ) : (
                        <>
                            <div className="flex justify-center items-center gap-5">
                                {!file.uploaded && !file.error && (
                                    <div className="flex justify-center items-center">
                                        <div className="radial-progress text-success-100" style={{ "--value": file.progress, "--size": "3rem", "--thickness": "3px" } as React.CSSProperties}>
                                            <span className="text-xs">{`${file.progress}%`}</span>
                                        </div>
                                    </div>
                                )}

                                {file.error && <AlertCircleIcon className="text-red-400" />}
                                <Link href={file.url} target="_blank">
                                    <span className="flex text-primary-200 hover:text-primary-100 text-center" >
                                        <Link2Icon />
                                    </span>
                                </Link>
                                <button
                                    onClick={() => setConfirmDeleteItem(file.id)}
                                    className="text-primary-200 hover:text-red-600" >
                                    <Trash2Icon />
                                </button>
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    )
}