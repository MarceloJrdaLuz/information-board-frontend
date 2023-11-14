import React from "react"
import Router from "next/router"
import { IListItemsProps } from "./types"
import Button from "../Button"
import { EditIcon, Trash } from "lucide-react"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"

function ListMeetingAssistance({ items }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {items?.map(item => (
        <li
          className={`flex flex-col flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={item.id}
        >
          <div className="flex w-full justify-start items-center p-6 pb-0 text-primary-200 font-semibold">
            <span className="font-semibold">{`${item.month} de ${item.year}`}</span>
          </div>
          <div className="flex flex-wrap justify-between w-full p-6 font-semi-bold text-sm">
            <div className="border border-blue-gray-200 w-full p-4 mb-4 text-primary-200 font-semibold">
              Reunião do meio de semana
              <div className="w-96 mt-2 text-gray-900">
                <span className=" font-semibold mr-5">Total:</span>
                <span>{item.midWeekTotal}</span>
              </div>
              <div className="w-96 text-gray-900">
                <span className=" font-semibold mr-5 ">Média: </span>
                <span>{item.midWeekAverage}</span>
              </div>
            </div>
            <div className="border border-blue-gray-200 w-full p-4 text-primary-200 font-semibold">
              Reunião do fim de semana
              <div className="w-96 mt-2 text-gray-900">
                <span className=" font-semibold mr-5">Total:</span>
                <span>{item.endWeekTotal}</span>
              </div>
              <div className="w-96 text-gray-900">
                <span className=" font-semibold mr-5 ">Média: </span>
                <span>{item.endWeekAverage}</span>
              </div>
            </div>
            {/* <div className="flex  mt-4  max-h-10">
              <div className="gap-1 flex">
                <Button
                  className="w-30"
                  onClick={() => Router.push(`/${path}/edit/${item.id}`)}
                  outline
                >
                  <EditIcon />
                  Editar
                </Button>
                <ConfirmDeleteModal
                  onDelete={() => onDelete(`${item.id}`)}
                  button={
                    <Button
                      outline
                      className="text-red-400 w-30"
                    >
                      <Trash />
                      Excluir
                    </Button>}
                />
              </div>
            </div> */}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListMeetingAssistance
