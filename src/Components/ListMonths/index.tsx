import { useEffect, useState } from "react"
import { obterUltimosMeses } from "@/functions/meses"
import Router, { useRouter } from "next/router"
import Button from "../Button"
import { FileSpreadsheetIcon } from "lucide-react"

export interface ListRelatoriosProps {
    congregationId: string
}


export default function ListMonths(props: ListRelatoriosProps) {
    const router = useRouter()
    const { congregationId } = router.query

    const [anoServicoAtual, setAnoServicoAtual] = useState<string[]>()
    const [anoServicoAnterior, setAnoServicoAnterior] = useState<string[]>()

    useEffect(() => {
        setAnoServicoAtual(obterUltimosMeses().anoCorrente)
        setAnoServicoAnterior(obterUltimosMeses().anoAnterior)
    }, [])

    return (
        <section className="flex flex-col flex-1 h-[90%] overflow-auto thin-scrollbar">
            <h1 className="flex flex-1 pl-5 pt-5 text-2xl text-primary-200 font-semibold ">Relatórios</h1>
            <Button  className="m-5 bg-white font-semibold text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80" onClick={() => router.push(`/relatorios/${congregationId}/cartao-publicador`)}>
                Criar registros
                <FileSpreadsheetIcon/>
            </Button>
            <div className="flex justify-evenly items-baseline">
                <>
                    <ul className="flex flex-col justify-start w-6/12 h-[65vh] overflow-auto  overflow-x-hidden items-center p-5  hide-scrollbar">
                        <span className="w-full min-w-[120px] py-5 text-xs sm:whitespace-nowrap lg:text-lg font-bold bg-primary-100 p-4  text-white">Ano de serviço atual</span>
                        {anoServicoAtual?.map(mes =>
                            <li onClick={() => {
                                Router.push(`/relatorios/${props.congregationId}/${mes}`)
                            }} key={mes} className={`flex justify-between items-center w-full bg-white hover:bg-sky-100 cursor-pointer m-1  p-3 sm:p-5 min-w-[120px] text-primary-200 font-semibold whitespace-nowrap text-sm sm:text-base`}>
                                {mes}
                            </li>)
                        }
                    </ul>
                    <ul className="flex flex-col justify-start w-6/12 h-[65vh] overflow-auto overflow-x-hidden items-center p-5 hide-scrollbar">
                        <span className="w-full min-w-[120px] py-5 text-xs sm:whitespace-nowrap lg:text-lg font-bold bg-primary-100 p-4  text-white">Ano de serviço anterior</span>
                        {anoServicoAnterior?.map(mes =>
                            <li onClick={() => {
                                Router.push(`/relatorios/${props.congregationId}/${mes}`)
                            }} key={mes} className={`flex justify-between items-center w-full bg-white hover:bg-sky-100 cursor-pointer m-1 h-14 p-3  sm:p-5 min-w-[120px] text-primary-200 font-semibold whitespace-nowrap text-sm sm:text-base`}>
                                {mes}
                            </li>)}
                    </ul>
                </>
            </div>
        </section>
    )
}
