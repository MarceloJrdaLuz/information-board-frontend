import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import EditIcon from "../Icons/EditIcon"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import { Trash } from "lucide-react"

function ListGroups({ items, label, onDelete }: IListItemsProps) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
      {items?.map((item) => (
        <li
          key={item.id}
          className="bg-surface-100 rounded-2xl border border-typography-200 shadow-sm hover:shadow-lg hover:border-typography-300 transition-all duration-200 flex flex-col"
        >
          {/* Conteúdo principal */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-typography-800 capitalize">
              {label} Nº {item.number}
            </h3>

            <div className="flex flex-col gap-2 text-sm text-typography-700">
              <div className="flex items-center gap-2">
                🏷 <span>Nome do {label}: {item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                👤 <span>Dirigente: {item.groupOverseers?.fullName ?? "Sem dirigente"}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 px-5 py-3 border-t border-typography-100 bg-surface-100 rounded-b-2xl">
            <Button
              size="sm"
              outline
              className="w-fit flex items-center gap-1"
              onClick={() =>
                Router.push({
                  pathname: `/congregacao/grupos/${item.id}/add-publicadores`,
                  query: { group_number: `${item.number}` },
                })
              }
            >
              <EditIcon className="w-4" /> Editar
            </Button>

            <ConfirmDeleteModal
              
              onDelete={() => onDelete(`${item.id}`)}
              button={
                <Button size="sm" outline className="text-red-500 w-fit flex items-center gap-1">
                  <Trash className="w-4" /> Excluir
                </Button>
              }
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListGroups
