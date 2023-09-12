import Link from "next/link";
import Button from "../Button";
import { IConsentMessageProps } from "./types";

export default function ConsentMessage({ onAccepted, onDecline, text, name, congregatioNumber }: IConsentMessageProps) {
    return (
        <div className="flex hide-scrollbar flex-col  w-fit max-w-[600px] h-fit max-h-[400px] absolute bottom-0 z-40 bg-gray-900 text-secondary-200 px-10 py-16  rounded-t-3xl overflow-auto">
            <div>
                <h2 className="mb-3 font-bold">Consentimento para Coleta e Armazenamento de Dados</h2>
                <h3 className="text-red-900 text-2xl font-bold">{name}</h3>
                <span>{text}</span>
                <div className="flex gap-2 pt-4">
                    <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black'
                        hoverColor='bg-button-hover' title="Aceitar" onClick={() => onAccepted()} />
                    <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black'
                        hoverColor='bg-button-hover' title="Recusar" onClick={() => onDecline(false)} />
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