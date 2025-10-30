import Link from "next/link"
import InformationBoardIcon from "../Icons/InformationBoardIcon"

interface FooterProps {
  ano: number | string
  nomeCongregacao: string
  aviso: string
  nCong?: string
}

export default function Footer({ ano, nomeCongregacao, aviso, nCong }: FooterProps) {
  return (
    <footer className="bg-primary-200 text-white py-6 text-sm sm:text-base">
      <div className="container mx-auto flex flex-col items-center space-y-3">
        {/* Linha superior */}
        <div className="flex flex-wrap justify-center items-center gap-2 text-center">
          <strong>{ano} | {nomeCongregacao}</strong>
        </div>

        {/* Aviso */}
        <p className="text-black text-center font-semibold">{aviso}</p>

        {/* Links */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-2">
          <Link href="/login" className="flex items-center gap-1 hover:opacity-80 transition">
            <InformationBoardIcon />
            <span className="text-xs sm:text-sm">Login</span>
          </Link>
          <Link href={`/${nCong}/politica-privacidade`}className="text-xs sm:text-sm hover:opacity-80 transition">
            Política de privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}
