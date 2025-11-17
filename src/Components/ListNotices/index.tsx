import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import EditIcon from "../Icons/EditIcon"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import { Trash } from "lucide-react"

export default function ListNotices({ notices, onDelete }: IListItemsProps) {
  return (
    <ul className="flex flex-col gap-4 w-full items-center mt-6">
      {notices?.map(notice => (
        <li
          key={notice.id}
          className="
            w-full md:w-10/12
            bg-surface-100 hover:bg-surface-100/80 transition-colors duration-300
            shadow-sm rounded-xl
            border border-surface-200/50
            overflow-hidden
          "
        >
          <div className="flex flex-col p-5 gap-4">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-200">
                  {notice.title}
                </h3>
                <p className="text-sm text-typography-400 mt-1">
                  {new Date(notice.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-3 sm:mt-0">
                <Button
                  size="sm"
                  outline
                  className="flex items-center gap-2 text-primary-200 hover:text-primary-100"
                  onClick={() => Router.push(`/anuncios/edit/${notice.id}`)}
                >
                  <EditIcon className="w-4 h-4" />
                  Editar
                </Button>
                <ConfirmDeleteModal
                  onDelete={() => onDelete(`${notice.id}`)}
                  button={
                    <Button
                      size="sm"
                      outline
                      className="flex items-center gap-2 text-red-400 hover:text-red-500"
                    >
                      <Trash className="w-4 h-4" />
                      Excluir
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Corpo */}
            <div className="text-sm leading-relaxed text-typography-700 bg-surface-200/30 rounded-lg p-4">
              {notice.text}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
