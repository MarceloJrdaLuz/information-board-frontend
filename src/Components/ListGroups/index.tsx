import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import { IListItemsProps } from "./types"
import { Situation } from "@/types/types"
import { AlertCircle, Edit3, Trash2, UserCheck, Users, Users2 } from "lucide-react"
import Router from "next/router"
import React from "react"

function ListGroups({ items, label, onDelete }: IListItemsProps) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 pb-28 w-full">
      {items?.map((item) => {
        const totalPublishers = item.publishers?.length ?? 0
        const inactivesCount =
          item.publishers?.filter(
            (p) => p.situation === Situation.INATIVO
          ).length ?? 0
        const activesCount = totalPublishers - inactivesCount
        const overseerName = item.groupOverseers?.fullName

        return (
          <li
            key={item.id}
            className="group bg-surface-100 rounded-2xl border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200/60 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Conteúdo Principal do Card */}
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              {/* Header do Card com Número e Quantidade */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-200/10 text-primary-200 font-bold text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>{label ? `${label} ${item.number}` : `Grupo ${item.number}`}</span>
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-typography-600 bg-surface-200 px-2.5 py-1 rounded-full">
                    {activesCount} {activesCount === 1 ? "ativo" : "ativos"}
                  </span>
                  {inactivesCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"
                      title={`${inactivesCount} publicador(es) inativo(s) neste grupo`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{inactivesCount} inativo{inactivesCount > 1 ? "s" : ""}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Nome do Grupo */}
              <div>
                <h3 className="text-lg font-bold text-typography-800 line-clamp-1">
                  {item.name || `Grupo Nº ${item.number}`}
                </h3>
              </div>

              {/* Box do Dirigente do Grupo */}
              <div className="bg-surface-200/70 border border-surface-300/60 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-200/15 text-primary-200 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-typography-500">
                    Dirigente do Grupo
                  </span>
                  <span className="text-sm font-bold text-typography-800 truncate">
                    {overseerName || "Sem dirigente definido"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas no Rodapé */}
            <div className="px-5 py-3.5 bg-surface-200/50 border-t border-surface-300/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                {/* Botão Gerenciar Publicadores */}
                <button
                  type="button"
                  onClick={() =>
                    Router.push({
                      pathname: `/congregacao/grupos-campo/${item.id}/add-publicadores`,
                      query: { group_number: `${item.number}` },
                    })
                  }
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs transition active:scale-95 shadow-sm"
                  title="Gerenciar publicadores do grupo"
                >
                  <Users2 className="w-4 h-4" />
                  <span>Publicadores</span>
                </button>

                {/* Botão Mudar Dirigente */}
                <button
                  type="button"
                  onClick={() =>
                    Router.push({
                      pathname: `/congregacao/grupos-campo/${item.id}/mudar-dirigente`,
                      query: { group_number: `${item.number}` },
                    })
                  }
                  className="p-2 rounded-xl bg-surface-100 hover:bg-surface-300 text-typography-700 border border-surface-300 transition"
                  title="Mudar dirigente do grupo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Botão Excluir */}
              <ConfirmDeleteModal
                onDelete={() => onDelete(`${item.id}`)}
                button={
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 transition active:scale-95"
                    title="Excluir grupo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                }
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default ListGroups
