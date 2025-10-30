import Link from "next/link"
import { IConsentMessageProps } from "./types"
import Button from "../Button"
import { ShieldCheck, XCircle } from "lucide-react"

export default function ConsentMessage({
  onAccepted,
  onDecline,
  text,
  name,
  congregatioNumber,
}: IConsentMessageProps) {
  return (
    <div
      className="fixed bottom-0 left-0 w-full z-50 flex justify-center px-4 pb-4 sm:pb-6"
    >
      <div className="relative bg-white border border-gray-200 shadow-lg rounded-2xl w-full max-w-lg p-6 sm:p-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-primary-500 w-7 h-7" />
          <h2 className="font-semibold text-lg text-gray-800">
            Consentimento de Dados
          </h2>
        </div>

        <div className="mb-2">
          <h3 className="text-xl font-bold text-primary-600 mb-1">{name}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Button
            onClick={() => onAccepted()}
            className="bg-primary-200 hover:bg-primary-600 text-white px-5"
          >
            Aceitar
          </Button>
          <Button
            onClick={() => onDecline(false)}
            className="bg-gray-200 hover:bg-gray-300 text-red-800"
          >
            Recusar
          </Button>
        </div>

        <div className="mt-5 text-center text-sm text-gray-500">
          Para mais informações, consulte nossa{" "}
          <Link
            target="_blank"
            href={`/${congregatioNumber}/politica-privacidade`}
            className="text-primary-200 hover:underline font-medium"
          >
            Política de Privacidade
          </Link>
          .
        </div>
      </div>
    </div>
  )
}
