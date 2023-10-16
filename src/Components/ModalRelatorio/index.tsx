import { IPublisher } from "@/entities/types"
import { reduzirNome } from "@/functions/reduzirNome"
import { FullNameShow } from "../FullNameShow"

interface ModalRelatorioProps {
    month: string
    year: string
    publisher: IPublisher
    publications?: number
    videos?: number
    hours: number
    revisits?: number
    studies?: number
    observations?: string
}

export default function ModalRelatorio(props: ModalRelatorioProps) {

    return (
        <li className="flex flex-col w-80 bg-white border border-1 border-gray-700 m-2 p-2">
            <span className="py-1 font-semibold w-full text-center">Relatório de Serviço de campo</span>
            <div className="flex ">
                <span className="font-semibold px-3 ">Nome:</span>
                <FullNameShow defaultName={`${props.publisher.nickname ? `(${props.publisher.nickname})` : ""} ${reduzirNome(props.publisher.fullName)}`} fullName={props.publisher.fullName}/>
            </div>
            <div className="flex ">
                <span className="font-semibold px-3">Mês:</span>
                <span className="border-b-2 border-dashed border-black w-full mr-3">{props.month}</span>
            </div>
            <div className="mt-3 border border-gray-700 divide-y  divide-gray-700">
                <div className="flex justify-between">
                    <span className="pl-2 ">Publicações:</span>
                    <span className="border-l border-gray-700 w-10 text-center">{props.publications}</span>
                </div>
                <div className="flex justify-between">
                    <span className="pl-2 ">Vídeos mostrados:</span>
                    <span className="border-l border-gray-700 w-10 text-center">{props.videos}</span>
                </div>
                <div className="flex justify-between">
                    <span className="pl-2 ">Horas:</span>
                    <span className="border-l border-gray-700 w-10 text-center"> {props.hours}</span>
                </div>
                <div className="flex justify-between">
                    <span className="pl-2 ">Revisitas:</span>
                    <span className="border-l border-gray-700 w-10 text-center">{props.revisits}</span>
                </div>
                <div className="flex justify-between">
                    <span className="pl-2 ">Estudos bíblicos:</span>
                    <span className="border-l border-gray-700 w-10 text-center">{props.studies}</span>
                </div>
            </div>
            <div className="flex justify-between border border-gray-700 mt-2 ">
                <span className="pl-2 ">Observações:</span>
                <span className="w-full h-12 pl-2 overflow-auto ">{props.observations}</span>
            </div>

        </li>
    )
}