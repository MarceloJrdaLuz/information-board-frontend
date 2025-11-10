import { IFileListProps } from "./types"
import { useState } from "react"
import { Link2Icon, Trash2Icon, CheckIcon, AlertCircleIcon } from 'lucide-react'
import Link from "next/link"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import 'react-circular-progressbar/dist/styles.css'
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"

export default function FileList({ files }: IFileListProps) {

    const [, setConfirmDeleteItem] = useState<string | null>(null)

    const { deleteDocument } = useDocumentsContext()


    const handleDelete = (document_id: string) => {
        deleteDocument(document_id)
        setConfirmDeleteItem(null)
    }

    return (
        <ul className="flex flex-col w-11/12 md:w-9/12 m-auto  justify-between items-center  cursor-pointer">
            {files?.map(file => (
                <li key={file.id} className="flex bg-surface-100  hover:bg-sky-100  mb-2  w-full  justify-between items-center p-6 border border-surface-300 rounded-2xl shadow-sm">
                    <div className="flex flex-col gap-3 justify-between">
                        <span className="font-bold text-typography-900" >{file.name}</span>
                        <span className="text-xs text-typography-500 " >{file.readableSize}</span>
                    </div>

                    <>
                        <div className="flex justify-center items-center gap-5">
                            {!file.uploaded && !file.error && (
                                <div className="flex justify-center items-center">
                                    <div className="flex justify-center items-center">
                                        {file.progress && file.progress < 100 ? (
                                            <div className="w-10 h-10">
                                                <>
                                                    <CircularProgressbar styles={buildStyles({
                                                        pathColor: `rgb(23 133 130)`,
                                                        textColor: 'rgb(23 133 130)',
                                                    })} text={`${file.progress}%`} value={file.progress!} />
                                                </>
                                            </div>
                                        ) : (
                                            <CheckIcon className="text-surface-100 p-1.5 bg-success-100 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            )}

                            {file.error && <AlertCircleIcon className="text-red-400" />}
                            <Link href={file.url} target="_blank">
                                <span className="flex text-primary-200 hover:text-primary-100 text-center" >
                                    <Link2Icon />
                                </span>
                            </Link>
                            <ConfirmDeleteModal
                                onDelete={() => handleDelete(file.id)}
                                button={<Trash2Icon className="text-primary-200 hover:text-red-400" />}
                            />
                        </div>
                    </>
                </li>
            ))}
        </ul>
    )
}