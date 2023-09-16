import React from "react";
import Router from "next/router";
import { iconeEdit } from "@/assets/icons";
import { IListItemsProps } from "./types";

function ListItems({ items, label, path }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center">
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
              <button
                onClick={() => Router.push(`/${path}/edit/${item.id}`)}
                className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3"
              >
                {iconeEdit('#178582')} <span className="text-primary-200 font-semibold pl-1">Editar</span>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ListItems;
