import React, { useCallback } from "react"
import { FileWithPath, useDropzone } from "react-dropzone"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { IUploadProps } from "./types"
import { UploadCloud, FileUp, AlertTriangle } from "lucide-react"

function Upload({ acceptFiles }: IUploadProps) {
  const { handleUpload } = useDocumentsContext()

  const onDrop = useCallback(
    (files: FileWithPath[]) => {
      handleUpload(files)
    },
    [handleUpload]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    accept: acceptFiles,
    onDrop
  })

  return (
    <div
      {...getRootProps()}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-6 sm:p-8 flex flex-col items-center justify-center text-center group select-none ${
        isDragReject
          ? "border-red-500 bg-red-500/10"
          : isDragActive
          ? "border-primary-200 bg-primary-100/20 ring-4 ring-primary-100/30 scale-[1.01]"
          : "border-surface-300 hover:border-primary-200/70 bg-surface-100/60 hover:bg-surface-100"
      }`}
    >
      <input {...getInputProps()} />

      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 shadow-xs ${
          isDragReject
            ? "bg-red-500 text-white"
            : isDragActive
            ? "bg-primary-200 text-white scale-110"
            : "bg-primary-100/15 text-primary-200 group-hover:bg-primary-100/25 group-hover:scale-105"
        }`}
      >
        {isDragReject ? (
          <AlertTriangle className="w-7 h-7" />
        ) : isDragActive ? (
          <FileUp className="w-7 h-7 animate-bounce" />
        ) : (
          <UploadCloud className="w-7 h-7" />
        )}
      </div>

      {isDragReject ? (
        <>
          <p className="text-sm sm:text-base font-semibold text-red-500">
            Formato de arquivo não suportado!
          </p>
          <p className="text-xs text-red-400/90 mt-1">
            Por favor, selecione apenas arquivos PDF (.pdf)
          </p>
        </>
      ) : isDragActive ? (
        <>
          <p className="text-sm sm:text-base font-semibold text-primary-200">
            Solte o arquivo PDF aqui
          </p>
          <p className="text-xs text-typography-500 mt-1">
            O upload será iniciado automaticamente
          </p>
        </>
      ) : (
        <>
          <p className="text-sm sm:text-base font-semibold text-typography-800 group-hover:text-primary-200 transition-colors">
            Arraste e solte o arquivo PDF aqui, ou{" "}
            <span className="text-primary-200 underline underline-offset-4 decoration-primary-200/50">
              escolha no dispositivo
            </span>
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-typography-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-200"></span>
            <span>Apenas arquivos PDF (.pdf)</span>
            <span>•</span>
            <span>Upload automático</span>
          </div>
        </>
      )}
    </div>
  )
}

export default Upload
