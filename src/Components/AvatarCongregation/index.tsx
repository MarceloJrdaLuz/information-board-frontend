import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Router from "next/router"
import { useCongregationContext } from "@/context/CongregationContext"
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
      {/* Avatar */}
      <div
        className="relative w-10 h-10 overflow-hidden bg-typography-100 rounded-full cursor-pointer hover:opacity-90 transition"
        onClick={() => setOpen(!open)}
      >
        {loading ? (
          <SkeletonAvatarCongregation />
        ) : congregationUser?.image_url ? (
          <Image
            src={congregationUser.image_url}
            fill
            sizes="33vw"
            alt="Foto da congregação"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-typography-100 rounded-full">
            <span className="font-medium text-typography-600">
              {congregationUser?.name?.slice(0, 1) ?? "?"}
            </span>
          </div>
        )}
      </div>

      {/* Mini Modal (Popover) */}
      {open && congregationUser && (
        <div className="absolute left-0 mt-2 w-60 bg-surface-100 border border-surface-200 rounded-xl shadow-xl z-50 p-2 animate-fade-in">
          <p className="text-sm text-typography-700 font-medium px-3 py-2 border-b border-surface-200">
            Congregação: {congregationUser.name} ({congregationUser.number})
          </p>

          <button
            onClick={() => handleOption("Informações da congregação")}
            className="w-full text-left px-3 py-2 rounded-lg text-typography-700 hover:bg-surface-200 transition"
          >
            Informações da congregação
          </button>

          <button
            onClick={() => handleOption("Ir para área pública")}
            className="w-full text-left px-3 py-2 rounded-lg text-typography-700 hover:bg-surface-200 transition"
          >
            Ir para área pública
          </button>
        </div>
      )}
    </div>
  )
}
