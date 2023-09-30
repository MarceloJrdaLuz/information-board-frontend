import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import { EditIcon, Trash } from "lucide-react"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import { useAtomValue } from "jotai"
import { buttonDisabled } from "@/atoms/atom"

function ListItems({ items, label, path, onDelete }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {items?.map(item => (
        <li
          className={`flex flex-col justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={item.id}
        >
          <div className="flex w-full justify-start items-center p-6 text-primary-200 font-semibold">
            Nome da {label}:
            <span className="font-normal ml-5">{item.name}</span>
          </div>
          <div className="flex justify-between w-full p-6 font-semi-bold">
            <div>
              <span className="text-primary-200 font-semibold mr-5">Descrição:</span>
              <span>{item.description}</span>
            </div>
            <div className="flex pl-10 max-h-10">
              <div className="gap-1 flex">
                <Button
                  onClick={() => Router.push(`/${path}/edit/${item.id}`)}
                  outline
                >
                  <EditIcon />
                  Editar
                </Button>
                <ConfirmDeleteModal
                  onDelete={() => onDelete(`${item.id}`)}
                  button={
                    <Button
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

export default ListItems
