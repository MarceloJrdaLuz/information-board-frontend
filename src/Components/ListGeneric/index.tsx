import { EditIcon, Trash } from "lucide-react";
import Button from "../Button";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import Router from "next/router";
import { IListItemsProps } from "./types";

export function ListGeneric<T extends { id: string }>({
  items,
  onDelete,
  renderItem,
  path,
  onUpdate,
  showActions = true,
  showEdit = true,
  showDelete = true
}: IListItemsProps<T>) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
      {items?.map((item) => (
        <li
          key={item.id}
          className="bg-surface-100 rounded-2xl border border-typography-200 shadow-sm hover:shadow-lg hover:border-typography-300 transition-all duration-200 flex flex-col"
        >
          {/* Conteúdo principal */}
          <div className="flex-1 p-5">{renderItem(item)}</div>

          {/* Ações */}
          {showActions && (showEdit || showDelete) && (
            <div className="flex gap-2 px-5 py-3 border-t border-typography-100 bg-surface-100 rounded-b-2xl">
              {showEdit && (
                <Button
                  size="sm"
                  className="w-fit"
                  outline
                  onClick={() => {
                    onUpdate?.(item)
                    Router.push(`${path}/edit/${item.id}`)
                  }}
                >
                  <EditIcon className="mr-1 w-4" /> Editar
                </Button>
              )}

              {showDelete && (
                <ConfirmDeleteModal
                  onDelete={() => onDelete(item.id)}
                  button={
                    <Button size="sm" outline className="text-red-500 w-fit">
                      <Trash className="mr-1 w-4" /> Excluir
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
