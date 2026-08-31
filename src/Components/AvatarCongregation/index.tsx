'use client'

import { useCongregationContext } from "@/context/CongregationContext"
import { Building2, ChevronDown, ExternalLink, Info } from "lucide-react"
import Image from "next/image"
import Router from "next/router"
import { useEffect, useRef, useState } from "react"
import SkeletonAvatarCongregation from "./skeletonAvatarCongregation"

interface AvatarCongregationProps {
  loading?: boolean
}

export default function AvatarCongregation({ loading }: AvatarCongregationProps) {
  const { congregation: congregationUser } = useCongregationContext()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha o modal ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleOption(option: string) {
    setOpen(false)

    switch (option) {
      case "Informações da congregação":
        if (Router.asPath !== "/congregacao/informacoes") {
          Router.push("/congregacao/informacoes")
        }
        break

      case "Ir para área pública":
        if (congregationUser?.number && Router.asPath !== `/${congregationUser.number}`) {
          Router.push(`/${congregationUser.number}`)
        }
        break

      default:
        break
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Botão / Chip da Congregação */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/15 backdrop-blur-xs text-white transition-all cursor-pointer shadow-2xs"
        title="Opções da congregação"
      >
        {/* Avatar */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 overflow-hidden bg-white/20 rounded-lg shrink-0 shadow-2xs">
          {loading ? (
            <SkeletonAvatarCongregation />
          ) : congregationUser?.image_url ? (
            <Image
              src={congregationUser.image_url}
              fill
              sizes="36px"
              alt="Foto da congregação"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          ) : (
            <div className="relative inline-flex items-center justify-center w-full h-full bg-white/20 text-white font-bold text-sm">
              {congregationUser?.name?.slice(0, 1) ?? <Building2 size={16} />}
            </div>
          )}
        </div>

        {/* Textos da congregação (escondido em telas minúsculas, visível a partir de sm) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-tight truncate max-w-[140px] md:max-w-[200px]">
            {congregationUser?.name ?? "Congregação"}
          </span>
          <span className="text-[10px] text-white/75 font-medium leading-none">
            {congregationUser?.number ? `Nº ${congregationUser.number}` : "Painel"}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`text-white/70 transition-transform duration-200 ${open ? "rotate-180 text-white" : ""}`}
        />
      </button>

      {/* Popover Moderno */}
      {open && congregationUser && (
        <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-surface-100 border border-surface-300 rounded-2xl shadow-xl z-50 p-2 animate-fade-in divide-y divide-surface-200">
          {/* Cabeçalho do Popover */}
          <div className="px-3 py-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-typography-500 block mb-0.5">
              Congregação Ativa
            </span>
            <p className="text-sm font-bold text-typography-900 leading-tight">
              {congregationUser.name}
            </p>
            {congregationUser.number && (
              <p className="text-xs text-primary-200 font-semibold mt-0.5">
                Número oficial: {congregationUser.number}
              </p>
            )}
          </div>

          {/* Links e Ações */}
          <div className="py-1.5 space-y-1">
            <button
              onClick={() => handleOption("Informações da congregação")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-typography-700 hover:text-primary-200 hover:bg-surface-200 transition text-left cursor-pointer"
            >
              <Info size={16} className="text-typography-400 shrink-0" />
              <span>Informações da congregação</span>
            </button>

            <button
              onClick={() => handleOption("Ir para área pública")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-typography-700 hover:text-primary-200 hover:bg-surface-200 transition text-left cursor-pointer"
            >
              <ExternalLink size={16} className="text-typography-400 shrink-0" />
              <span>Ir para o Quadro Público</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}