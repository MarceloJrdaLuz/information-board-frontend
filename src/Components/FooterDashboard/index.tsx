import { useAuthContext } from "@/context/AuthContext"
import Link from "next/link"

export default function FooterDashboard() {
  const { user } = useAuthContext()

  return (
    <footer
      className="
        w-full bg-primary-100 shadow-md py-3
      "
    >
      <div
        className="
          container mx-auto flex items-center justify-between
          px-4 text-sm text-gray-800
        "
      >
        <span
          className="
            bg-secondary-200 border border-gray-400
            rounded-md px-3 py-1 font-medium text-gray-900
          "
        >
          {user?.code ?? "Sem código"}
        </span>

        <Link
          href="/termos-de-uso"
          className="
            text-gray-700 hover:text-primary-700 hover:underline
            transition-colors duration-200
          "
        >
          Política de Privacidade
        </Link>
      </div>
    </footer>
  )
}
