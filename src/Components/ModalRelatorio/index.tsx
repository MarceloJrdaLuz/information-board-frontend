import { reduzirNome } from "@/functions/reduzirNome"
import { IPublisher } from "@/types/types"
import { CheckSquareIcon, SquareIcon } from "lucide-react"
import { FullNameShow } from "../FullNameShow"

interface ModalRelatorioProps {
    month: string
    year: string
    publisher: IPublisher
    hours: number
    studies?: number
    observations?: string
}

export default function ModalRelatorio(props: ModalRelatorioProps) {

    return (
        <li className="flex flex-col min-w-[280px] max-w-[340px] bg-surface-100 border border-1 border-typography-700 m-2 p-2 text-typography-900">
            <span className="py-1 font-semibold  w-full text-center">Relatório de Serviço de campo</span>
            <div className="flex ">
                <span className="font-semibold px-3 ">Nome:</span>
                <FullNameShow defaultName={props.publisher.nickname ? props.publisher.nickname : `${reduzirNome(props.publisher.fullName)}`} />
            </div>
            <div className="flex ">
                <span className="font-semibold px-3">Mês:</span>
                <span className="border-b-2 border-dashed border-typography-900 w-full mr-3">{props.month}</span>
            </div>
            <div className="mt-3 border border-typography-700 divide-y  divide-typography-700">
                <div className="flex justify-between items-center pr-2">
                    <span className="pl-2 text-xs font-semibold text-typography-900">Marque se você participou em alguma modalidade do ministério durante o mês.</span>
                    {props.hours === 0 ? <CheckSquareIcon className="w-10 h-10 text-typography-900" /> : <SquareIcon className="w-10 h-10 text-typography-900" />}
                </div>
                <div className="flex justify-between items-center">
                    <span className="pl-2 text-xs font-semibold text-typography-900 w-11/12">Estudos bíblicos:</span>
                    <span className="border-l border-typography-700 w-10 text-center">{props.studies}</span>
                </div>
                <div className="flex justify-between">
                    <span className="pl-2 text-xs font-semibold text-typography-900 w-11/12">{`Horas (se for pioneiro auxiliar, regular, especial ou missionário em campo)`}</span>
                    <span className="border-l border-typography-700 w-10 text-center "> {props.hours > 0 && props.hours}</span>
                </div>
            </div>
            <div className="flex justify-between border border-typography-700 mt-2 ">
                <span className="pl-2 text-xs font-semibold text-typography-900">Observações:</span>
                <span className="w-full h-12 pl-2 overflow-auto ">{props.observations}</span>
            </div>

        </li>
    )
}