import { useEffect, useState } from "react"
import { obterUltimosMeses } from "@/functions/meses"
import Router from "next/router"

export interface ListRelatoriosProps {
    congregationId: string
}


export default function ListMonths(props: ListRelatoriosProps) {
    const [anoServicoAtual, setAnoServicoAtual] = useState<string[]>()
    const [anoServicoAnterior, setAnoServicoAnterior] = useState<string[]>()

    useEffect(() => {
        setAnoServicoAtual(obterUltimosMeses().anoCorrente)
        setAnoServicoAnterior(obterUltimosMeses().anoAnterior)
    }, [])

    return (
        <section className="flex flex-col">
            <h1 className="flex flex-1 pl-5 pt-5 text-2xl text-fontColor-200 font-semibold ">Relatórios</h1>
            <div className="flex justify-evenly items-baseline">
                <>
                    <ul className="flex flex-wrap justify-start w-6/12 items-center p-5">
                        <span className="w-full py-5 font-semibold whitespace-nowrap text-xs lg:text-lg text-fontColor-100">Ano de serviço atual</span>
                        {anoServicoAtual?.map(mes =>
                            <li onClick={() => {
                                Router.push(`/relatorios/${props.congregationId}/${mes}`)
                            }} key={mes} className={`flex justify-between items-center w-full bg-white hover:bg-sky-100 cursor-pointer m-1 h-14 p-5 text-primary-200 font-semibold whitespace-nowrap text-sm sm:text-base`}>
                                {mes}
                            </li>)
                        }
                    </ul>
                    <ul className="flex flex-wrap justify-start w-6/12 items-center p-5">
                        <span className="w-full py-5 font-semibold text-xs whitespace-nowrap lg:text-lg text-fontColor-100">Ano de serviço anterior</span>
                        {anoServicoAnterior?.map(mes =>
                            <li onClick={() => {
                                Router.push(`/relatorios/${props.congregationId}/${mes}`)
                            }} key={mes} className={`flex justify-between items-center w-full bg-white hover:bg-sky-100 cursor-pointer m-1 h-14 p-5 text-primary-200 font-semibold whitespace-nowrap text-sm sm:text-base`}>
                                {mes}
                            </li>)}
                    </ul>
                </>
            </div>
        </section>
    )
}
