'use client'

import { useAuthContext } from "@/context/AuthContext"
import { getInitials } from "@/functions/getInitials"
import { ChevronDown, LogOut, Shield, User } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import avatarFemale from "../../../public/images/avatar-female.png"
import avatarMale from "../../../public/images/avatar-male.png"
import SkeletonAvatar from "./skeletonAvatar"
import { IAvatar } from "./types"

export default function Avatar(props: IAvatar) {
  const { logout, user } = useAuthContext()
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

  const defaultAvatar = props.gender === "Feminino" ? avatarFemale : avatarMale

  return (
    <div className="relative" ref={ref}>
      {/* Chip do Usuário */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/15 backdrop-blur-xs text-white transition-all cursor-pointer shadow-2xs"
        title="Menu do usuário"
      >
        {/* Foto do Avatar */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 overflow-hidden bg-white/20 rounded-full shrink-0 shadow-2xs border border-white/30">
          {props.loading ? (
            <SkeletonAvatar />
          ) : props.avatar_url ? (
            <Image
              style={{ objectFit: "cover", objectPosition: "center" }}
              src={props.avatar_url}
              fill
              sizes="36px"
              alt="Foto de perfil"
            />
          ) : props.gender ? (
            <Image
              style={{ objectFit: "cover", objectPosition: "center" }}
              src={defaultAvatar}
              fill
              sizes="36px"
              alt={`Avatar de um(a) ${props.gender === "Feminino" ? "mulher" : "homem"}`}
            />
          ) : (
            <div className="relative inline-flex items-center justify-center w-full h-full bg-white/20 text-white font-bold text-xs">
              {getInitials(props.userName ?? "")}
            </div>
          )}
        </div>

        {/* Nome do usuário e papel (escondido em telas pequenas) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px] md:max-w-[160px]">
            {props.userName ?? "Usuário"}
          </span>
          <span className="text-[10px] text-white/75 font-medium leading-none">
            {user?.roles?.length ? "Painel Ativo" : "Conta"}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`text-white/70 transition-transform duration-200 ${open ? "rotate-180 text-white" : ""}`}
        />
      </button>

      {/* Popover Moderno do Usuário */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-surface-100 border border-surface-300 rounded-2xl shadow-xl z-50 p-2 animate-fade-in divide-y divide-surface-200">
          {/* Cabeçalho do Perfil */}
          <div className="p-3 flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden bg-primary-200/10 rounded-full shrink-0 border border-primary-200/20 flex items-center justify-center text-primary-200 font-bold">
              {props.avatar_url ? (
                <Image
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  src={props.avatar_url}
                  fill
                  sizes="40px"
                  alt="Foto"
                />
              ) : (
                <span>{getInitials(props.userName ?? "")}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-typography-900 leading-tight truncate">
                {props.userName}
              </p>
              {user?.email && (
                <p className="text-[11px] text-typography-500 truncate mt-0.5">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="py-1.5">
            <button
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
            >
              <LogOut size={16} className="shrink-0" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}