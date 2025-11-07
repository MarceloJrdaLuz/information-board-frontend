import { useState, useRef, useEffect } from "react"
import { useAuthContext } from "@/context/AuthContext"
import Image from "next/image"
import { IAvatar } from "./types"
import { getInitials } from "@/functions/getInitials"
import SkeletonAvatar from "./skeletonAvatar"

export default function Avatar(props: IAvatar) {
  const { logout } = useAuthContext()
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

  return (
    <div className="relative" ref={ref}>
      {/* Avatar */}
      <div
        className="relative w-10 h-10 overflow-hidden bg-primary-50 rounded-full cursor-pointer hover:opacity-90 transition"
        onClick={() => setOpen(!open)}
      >
        {props.loading ? (
          <SkeletonAvatar />
        ) : props.avatar_url ? (
          <Image
            style={{ objectFit: "cover", objectPosition: "top center" }}
            src={props.avatar_url}
            fill
            alt="Foto de perfil"
          />
        ) : (
          <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-primary-50 rounded-full">
            <span className="font-medium text-typography-600">
              {getInitials(props.userName ?? "")}
            </span>
          </div>
        )}
      </div>

      {/* Mini Modal (Popover) */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-60 bg-surface-100 border border-surface-200 rounded-xl shadow-xl z-50 p-2 animate-fade-in"
        >
          <p className="text-sm text-typography-700 font-medium px-3 py-2 border-b border-surface-200 ">
            {props.userName}
          </p>
          <button
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-typography-700 hover:bg-surface-200 transition"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
