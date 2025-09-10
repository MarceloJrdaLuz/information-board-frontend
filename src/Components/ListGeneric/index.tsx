import { EditIcon, Trash } from "lucide-react";
import Button from "../Button";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import Router from "next/router";
import { IListItemsProps } from "./types";

export function ListGeneric<T extends { id: string }>({ items, onDelete, renderItem, path, onUpdate }: IListItemsProps<T>) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5 gap-2">
      {items?.map(item => (
        <li
          key={item.id}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 w-full"
        >
          <div className="flex flex-col justify-between w-full p-4 md:p-6">
            <div className="flex flex-1 justify-between flex-wrap">{renderItem(item)}</div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="w-fit" outline onClick={() => {
                onUpdate?.(item)
                Router.push(`${path}/edit/${item.id}`)
              }}>
                <EditIcon className="mr-1 w-4" /> Editar
              </Button>
              <ConfirmDeleteModal
                onDelete={() => onDelete(item.id)}
                button={
                  <Button size="sm" outline className="text-red-500 w-fit">
                    <Trash className="mr-1 w-4" /> Excluir
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
