import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import EditIcon from "../Icons/EditIcon"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import { Trash } from "lucide-react"

function ListGroups({ items, label, onDelete }: IListItemsProps) {
  return (
    <ul className="flex w-full flex-wrap justify-center mt-5 gap-4">
      {items?.map(item => (
        <li
          key={item.id}
          className="flex flex-col gap-3 p-4 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow w-full md:w-10/12 cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-gray-800 capitalize">{label} Nº {item.number}</h3>

          <div className="flex flex-col gap-2 text-gray-600">
            <div className="flex items-center gap-2">
              🏷 <span>Nome do {label}: {item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              👤 <span>Dirigente: {item.groupOverseers?.fullName ?? "Sem dirigente"}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              className="flex items-center gap-1"
              onClick={() =>
                Router.push({
                  pathname: `/congregacao/grupos/${item.id}/add-publicadores`,
                  query: { group_number: `${item.number}` },
                })
              }
              outline
            >
              <EditIcon /> Editar
            </Button>
            <ConfirmDeleteModal
              onDelete={() => onDelete(`${item.id}`)}
              button={
                <Button outline className="flex items-center gap-1 text-red-400">
                  <Trash /> Excluir
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
