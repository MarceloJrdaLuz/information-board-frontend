import { IPublisher, IReports, Privileges } from "@/entities/types"
import { CheckSquareIcon, SquareIcon } from "lucide-react"
import moment from "moment"

export interface S21Props {
    serviceYear: string
    months: string[]
    publisher: IPublisher
    reports?: IReports[]
}

export default function S21({ months, reports, publisher, serviceYear }: S21Props) {

    return (
        <section className="w-[595px] h-[892px] m-4 bg-white p-4 ">
            <div>
                <h1 className="w-full text-center my-3 font-bold">REGISTRO DE PUBLICADOR DE CONGREGAÇÃO</h1>
                <div className="flex justify-between font-semibold text-xs">
                    <div className="flex flex-col gap-1">
                        <span>Nome:
                            <span>{publisher.fullName}</span>
                        </span>
                        <span>Data de nascimento:
                            {publisher.birthDate && <span>{moment(publisher.birthDate).format('DD/MM/YYYY')}</span>}
                        </span>
                        <span>Data de batismo:
                            {publisher.dateImmersed && <span>{moment(publisher.dateImmersed).format('DD/MM/YYYY')}</span>}
                        </span>
                    </div>
                    <div className="flex flex-col justify-end ">
                        <div className="flex items-center ">
                            {publisher.gender === "Masculino" ? <CheckSquareIcon className="w-3" /> : <SquareIcon className="w-3" />}
                            <span className="pl-1 w-32">Masculino</span>
                            {publisher.gender === "Feminino" ? <CheckSquareIcon className="w-3" /> : <SquareIcon className="w-3" />}
                            <span className="pl-1">Feminino</span>
                        </div>
                        <div className="flex items-center">
                            {publisher.hope === "Outras ovelhas" ? <CheckSquareIcon className="w-3" /> : <SquareIcon className="w-3" />}
                            <span className="pl-1 w-32">Outras ovelhas</span>
                            {publisher.hope === "Ungido" ? <CheckSquareIcon className="w-3" /> : <SquareIcon className="w-3" />}
                            <span className="pl-1">Ungido</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-start text-xs font-semibold mt-1">
                    {publisher.privileges.includes(Privileges.ANCIAO) ? <CheckSquareIcon className="w-4 h-fit mt-0.5" /> : <SquareIcon className="w-4 h-fit mt-0.5" />}
                    <span className="pl-1 pr-3 whitespace-nowrap ">Ancião</span>
                    {publisher.privileges.includes(Privileges.SM) ? <CheckSquareIcon className="w-4 h-fit mt-0.5" /> : <SquareIcon className="w-4 h-fit mt-0.5" />}
                    <span className="pl-1 pr-3 whitespace-nowrap">Servo ministerial</span>
                    {publisher.privileges.includes(Privileges.PIONEIROREGULAR) ? <CheckSquareIcon className="w-4 h-fit mt-0.5" /> : <SquareIcon className="w-4 h-fit mt-0.5" />}
                    <span className="pl-1 pr-3 whitespace-nowrap">Pioneiro regular</span>
                    {publisher.privileges.includes(Privileges.PIONEIROESPECIAL) ? <CheckSquareIcon className="w-4 h-fit mt-0.5" /> : <SquareIcon className="w-4 h-fit mt-0.5" />}
                    <span className="pl-1 pr-3 whitespace-nowrap">Pioneiro especial</span>
                    {publisher.privileges.includes(Privileges.MISSIONARIOEMCAMPO) ? <CheckSquareIcon className="w-4 h-fit mt-0.5" /> : <SquareIcon className="w-4 h-fit mt-0.5" />}
                    <span className="pl-1 pr-3 flex items-baseline">Missionário em campo</span>
                </div>
                <table className="h-[280px] text-xs border-collapse table-fixed">
                    <thead>
                        <tr className="text-center font-semibold">
                            <td className="border border-gray-900 w-28 h-16 ">
                                <div className="flex flex-col">
                                    <span className="font-semibold">Ano de serviço</span>
                                    <span className="font-normal">{serviceYear}</span>
                                </div>
                            </td>
                            <td className="border border-gray-900 w-20 px-2" >Participou no ministério</td>
                            <td className="border border-gray-900 w-20" >Estudos bíblicos</td>
                            <td className="border border-gray-900 w-20"  >Pioneiro auxiliar</td>
                            <td className="border border-gray-900 w-20" >
                                <div className="flex flex-col">
                                    <span>Horas</span>
                                    <span className="font-normal text-[10px]">(se for pioneiro ou missionário em campo)
                                    </span>
                                </div>
                            </td>
                            <td className="border border-gray-900 w-40" >Observações</td>
                        </tr>
                    </thead>
                    <tbody >
                        {months.map((month) => (
                            <tr className="h-5" key={month + "2"}>
                                <td className="border border-gray-900 pl-1">{month}</td>
                                <td className="border border-gray-900 text-center">
                                    <span className="flex justify-center">
                                        <SquareIcon className="w-4 text-gray-900" />
                                    </span>
                                </td>
                                <td className="border border-gray-900 "></td>
                                <td className="border border-gray-900">
                                    <span className="flex justify-center">
                                        <SquareIcon className="w-4 text-gray-900" />
                                    </span>
                                </td>
                                <td className="border border-gray-900"></td>
                                <td className="border border-gray-900"></td>
                            </tr>
                        ))}
                        <tr className="h-6">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-end pr-1 font-semibold">Total</td>
                            <td className=" border border-gray-900"></td>
                            <td className=" border border-gray-900"></td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </section>
    )
}