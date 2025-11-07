import { useAuthContext } from "@/context/AuthContext"
import Link from "next/link"
import ThemeSwitcher from "../ThemeSwitcher"

export default function FooterDashboard() {
  const { user } = useAuthContext()

  return (
    <footer
      className="
        w-full bg-gradient-to-l from-primary-100 to-primary-200 shadow-md py-3
      "
    >
      <div
        className="
          container mx-auto flex items-center justify-between
          px-4 text-sm text-typography-800
        "
      >
        <ThemeSwitcher />

        <span
          className="
            bg-secondary-200 border border-typography-400
            rounded-md px-3 py-1 font-medium text-typography-900
          "
        >
          {user?.code ?? "Sem código"}
        </span>

        <Link
          href="/termos-de-uso"
          className="
            text-typography-700 hover:text-primary-700 hover:underline
            transition-colors duration-200
          "
        >
          Política de Privacidade
        </Link>
      </div>
    </footer>
  )
}
