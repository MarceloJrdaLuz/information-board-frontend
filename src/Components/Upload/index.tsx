import React, { useCallback } from "react"
import { FileWithPath, useDropzone } from "react-dropzone"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { IUploadProps } from "./types"

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

  const renderDragMessage = useCallback(() => {
    if (!isDragActive) {
      return <div>Arraste os arquivos aqui...</div>
    }

    if (isDragReject) {
      return (
        <div className="w-full h-full flex justify-center items-center text-red-400">
          Tipo de arquivo não suportado!
        </div>
      )
    }

    return <div >Solte os arquivos aqui...</div>
  }, [isDragActive, isDragReject])

  return (
    <div className={`flex justify-center items-center w-full h-full border-2 border-dashed text-primary-200 font-bold hover:bg-primary-100 hover:bg-opacity-40  hover:text-gray-900 ${!isDragReject ? "border-primary-200" : "border-red-700"}`} {...getRootProps()}>
      <input className="bg-red-400" {...getInputProps()} />
      {renderDragMessage()}
    </div>
  )
}

export default Upload