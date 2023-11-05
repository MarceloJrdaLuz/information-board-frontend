import Link from "next/link"
import { IConsentMessageProps } from "./types"
import Button from "../Button"

export default function ConsentMessage({ onAccepted, onDecline, text, name, congregatioNumber }: IConsentMessageProps) {
    return (
        <div className="flex hide-scrollbar flex-col  w-full max-w-[600px] h-fit max-h-[400px] absolute bottom-0 z-40 bg-gray-50 text-gray-900 px-10 py-16  rounded-t-3xl overflow-auto">
            <div>
                <h2 className="mb-3 font-bold">Consentimento para Coleta e Armazenamento de Dados</h2>
                <h3 className="text-red-400 text-2xl font-bold">{name}</h3>
                <span>{text}</span>
                <div className="flex justify-center items-center gap-2 pt-4">
                    <Button onClick={() => onAccepted()} >Aceitar</Button>
                    <Button  onClick={() => onDecline(false)}>Recusar</Button>
                </div>
                <div className="mt-4 overflow-auto">
                    <span>
                        Para mais informações, consulte nossa <Link target="_blank" className="text-blue-500 hover:underline" href={`/${congregatioNumber}/politica-privacidade`}>
                            Política de Privacidade.
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    )
}