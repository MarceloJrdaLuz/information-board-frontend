import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import { EditIcon, Trash } from "lucide-react"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"

export default function ListItems({ items, label, path, onDelete }: IListItemsProps) {
  return (
    <ul className="flex w-full flex-wrap justify-center mt-6 gap-4">
      {items?.map(item => (
        <li
          key={item.id}
          className="
            flex flex-col w-full md:w-10/12
            bg-surface-100 border border-surface-300
            rounded-2xl shadow-sm
            hover:shadow-md hover:-translate-y-[2px]
            transition-all duration-300
            overflow-hidden
            cursor-pointer
          "
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-surface-300">
            <div className="flex flex-col">
              <span className="text-sm text-typography-500 font-medium">
                Nome {label}
              </span>
              <span className="text-lg font-semibold text-typography-900">
                {item.name}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <span className="block text-sm text-typography-500 font-medium mb-1">
                Descrição
              </span>
              <p className="text-typography-900 text-sm leading-relaxed break-words">
                {item.description || "Sem descrição"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center gap-2 mt-2 md:mt-0">
              <Button
                size="sm"
                outline
                className="w-fit flex items-center gap-1"
                onClick={() => Router.push(`/${path}/edit/${item.id}`)}
              >
                <EditIcon size={16} />
                Editar
              </Button>

              <ConfirmDeleteModal
                onDelete={() => onDelete(`${item.id}`)}
                button={
                  <Button
                    size="sm" outline className="text-red-500 w-fit flex items-center gap-1"
                  >
                    <Trash size={16} />
                    Excluir
                  </Button>
                }
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
