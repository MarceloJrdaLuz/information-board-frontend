import { EditIcon, Trash } from "lucide-react";
import Button from "../Button";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import Router from "next/router";
import { IListItemsProps } from "./types";

export function ListGeneric<T extends { id: string }>({ items, onDelete, renderItem, path }: IListItemsProps<T>) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {items?.map(item => (
        <li
          key={item.id}
          className="flex flex-col flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1"
        >
          <div className="flex flex-col justify-between w-full p-6">
            <div className="flex flex-1 flex-wrap">{renderItem(item)}</div>
            <div className="flex gap-2">
              <Button
                outline
                onClick={() => Router.push(`${path}/edit/${item.id}`)}
              >
                <EditIcon />
                Editar
              </Button>
              <ConfirmDeleteModal
                onDelete={() => onDelete(item.id)}
                button={
                  <Button outline className="text-red-400">
                    <Trash />
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
