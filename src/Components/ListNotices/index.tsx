import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import EditIcon from "../Icons/EditIcon"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import { Trash } from "lucide-react"

function ListNotices({ notices, onDelete }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {notices?.map(notice => (
        <li
          className={`flex flex-col flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={notice.id}
        >
          <div className="flex w-full justify-start items-center p-6 text-primary-200 font-semibold">
            Título do anúncio:
            <span className="font-normal ml-5">{notice.title}</span>
          </div>
          <div className="flex flex-wrap justify-between w-full px-6 pb-6 font-semi-bold">
            <div className="w-96">
              <span className="text-primary-200 font-semibold mr-5">Conteúdo:</span>
              <span>{notice.text}</span>
            </div>
            <div className="flex mt-4">

              <div className="gap-1 flex items-end">
                <Button
                  onClick={() => Router.push(`/anuncios/edit/${notice.id}`)}
                  outline
                >
                  <EditIcon />
                  Editar
                </Button>
                <ConfirmDeleteModal
                  onDelete={() => onDelete(`${notice.id}`)}
                  button={<Button
                    outline
                    className="text-red-400"
                  >
                    <Trash />
                    Excluir
                  </Button>}
                />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListNotices
