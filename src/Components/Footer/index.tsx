import Link from "next/link"
import InformationBoardIcon from "../Icons/InformationBoardIcon"
import ThemeSwitcher from "../ThemeSwitcher"
import { themeAtom } from "@/atoms/themeAtoms"
import { useAtomValue } from "jotai"

interface FooterProps {
  ano: number | string
  nomeCongregacao: string
  aviso: string
  nCong?: string
}

export default function Footer({ ano, nomeCongregacao, aviso, nCong }: FooterProps) {
  const themeAtomValue = useAtomValue(themeAtom)
  const isDark = themeAtomValue === "theme-dark"
  return (
    <footer className={`${!isDark ? "bg-gradient-to-tl from-primary-200 to-primary-100" : "border border-t-typography-800 bg-gradient-to-b from-surface-100 to-surface-200"}  border-surface-200 text-surface-100 py-6 text-sm sm:text-base`}>
      <div className="container mx-auto flex flex-col items-center space-y-3">
        {/* Linha superior */}
        <div className="text-typography-200 flex flex-wrap justify-center items-center gap-2 text-center">
          <strong>{ano} | {nomeCongregacao}</strong>
        </div>

        {/* Aviso */}
        <p className="text-typography-200 text-center font-semibold">{aviso}</p>

        {/* Links */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-2 text-typography-200">
          <ThemeSwitcher />
          <Link href="/login" className="flex items-center gap-1 hover:opacity-80 transition">
            <InformationBoardIcon />
            <span className="text-xs sm:text-sm">Login</span>
          </Link>
          <Link href={`/${nCong}/politica-privacidade`} className="text-xs sm:text-sm hover:opacity-80 transition">
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
