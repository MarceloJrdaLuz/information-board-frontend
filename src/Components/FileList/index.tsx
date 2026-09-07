import { IFileListProps } from "./types"
import { Trash2Icon, CheckIcon, AlertCircleIcon, FileText, ExternalLink } from 'lucide-react'
import Link from "next/link"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import 'react-circular-progressbar/dist/styles.css'
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"

export default function FileList({ files }: IFileListProps) {
    const { deleteDocument } = useDocumentsContext()

    const handleDelete = async (document_id: string) => {
        await deleteDocument(document_id)
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            {files?.map(file => (
                <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-surface-100 border border-surface-300 rounded-2xl shadow-xs hover:border-surface-300/80 transition-all duration-150"
                >
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm sm:text-base text-typography-800 truncate" title={file.name}>
                                {file.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-typography-500">
                                <span className="font-medium">{file.readableSize}</span>
                                <span>•</span>
                                {file.uploaded ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                        <CheckIcon className="w-3 h-3" />
                                        <span>Pronto</span>
                                    </span>
                                ) : file.error ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                                        <AlertCircleIcon className="w-3 h-3" />
                                        <span>Erro no upload</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-200 bg-primary-100/15 px-2 py-0.5 rounded-md">
                                        <span>Enviando...</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-200">
                        {!file.uploaded && !file.error && (
                            <div className="w-8 h-8 mr-1">
                                <CircularProgressbar
                                    styles={buildStyles({
                                        pathColor: 'rgb(23 133 130)',
                                        textColor: 'rgb(23 133 130)',
                                        textSize: '28px',
                                    })}
                                    text={`${file.progress || 0}%`}
                                    value={file.progress || 0}
                                />
                            </div>
                        )}

                        {file.url && (
                            <Link
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary-200 bg-primary-100/10 hover:bg-primary-100/20 border border-primary-200/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Visualizar</span>
                            </Link>
                        )}

                        <ConfirmDeleteModal
                            title="Excluir documento"
                            message={`Tem certeza que deseja excluir "${file.name}"? Essa ação não pode ser desfeita.`}
                            onDelete={() => handleDelete(file.id)}
                            button={
                                <button
                                    type="button"
                                    className="p-2 rounded-xl text-typography-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                    title="Excluir documento"
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </button>
                            }
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
