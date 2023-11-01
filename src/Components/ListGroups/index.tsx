import React from "react";
import Router from "next/router";
import { IListItemsProps } from "./types";
import Button from "../Button";
import EditIcon from "../Icons/EditIcon";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { Trash } from "lucide-react";

function ListGroups({ items, label, onDelete }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {items?.map(item => (
        <li
          className={`flex flex-col flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={item.id}
        >
          <div className="flex flex-col sm:flex-row w-full justify-between sm:items-center p-6 text-primary-200 font-semibold">
            <div className="py-6">
              <span>Nome do {label}:</span>
              <span className="font-normal ml-5">{item.name}</span>
            </div>
            <div className="py-6">
              <span className="text-primary-200 font-semibold mr-5">Número do grupo</span>
              <span>{item.number}</span>
            </div>
          </div>
          <div className="flex  flex-wrap w-full justify-between items-center px-6 pb-6 text-primary-200 font-semibold">
            <div className="w-60">
              <span className="mr-5">Dirigente:</span>
              <span className="font-normal ">{item.groupOverseers?.fullName ?? "Sem dirigente"}</span>
            </div>
            <div className="flex  mt-4  max-h-10">
              <div className="gap-1 flex">
                <Button
                className="w-30"
                  onClick={() => Router.push({
                    pathname: `/grupos/${item.id}/add-publicadores`,
                    query: { group_number: `${item.number}` }
                  })}
                  outline
                >
                  <EditIcon />
                  Editar
                </Button>
                <ConfirmDeleteModal
                  onDelete={() => onDelete(`${item.id}`)}
                  button={<Button
                    outline
                    className="text-red-400 w-30"
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
  );
}

export default ListGroups;
