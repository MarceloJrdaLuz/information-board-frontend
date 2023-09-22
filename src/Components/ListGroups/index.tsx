import React from "react";
import Router from "next/router";
import { iconeEdit } from "@/assets/icons";
import { IListItemsProps } from "./types";

function ListGroups({ items, label, path }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center">
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
                <span className="font-normal ml-5">{item.groupOverseers.fullName}</span>
              </div>
              <div className="flex pl-10 max-h-10">
                <button
                  onClick={() => Router.push({
                    pathname: `/grupos/${item.id}/add-publicadores`, 
                    query: {group_number: `${item.number}`}
                  })}
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

export default ListGroups;
