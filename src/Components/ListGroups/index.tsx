import React from "react";
import Router from "next/router";
import { IListItemsProps } from "./types";
import Button from "../Button";
import EditIcon from "../Icons/EditIcon";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { Trash } from "lucide-react";

function ListGroups({ items, label, path, onDelete }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {items?.map(item => (
        <li
          className={`flex flex-col justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={item.id}
        >
          <div className="flex flex-col sm:flex-row w-full justify-between sm:items-center p-6 text-primary-200 font-semibold">
            <div>
              <span>Nome do {label}:</span>
              <span className="font-normal ml-5">{item.name}</span>
            </div>
            <div>
              <span className="text-primary-200 font-semibold mr-5">Número do grupo</span>
              <span>{item.number}</span>
            </div>
          </div>
          <div className="flex w-full justify-between items-center p-6 text-primary-200 font-semibold">
            <div>
              <span>Dirigente:</span>
              <span className="font-normal ml-5">{item.groupOverseers?.fullName ?? "Sem dirigente"}</span>
            </div>
            <div className="flex pl-10 max-h-10">
              <div className="gap-1 flex">
                <Button
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
  );
}

export default ListGroups;
