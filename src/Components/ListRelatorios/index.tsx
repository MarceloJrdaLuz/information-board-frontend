import { IPublisher, IReports } from "@/entities/types"
import { api } from "@/services/api"
import { useCallback, useEffect, useState } from "react"
import { obterUltimosMeses } from "@/functions/meses"
import ModalRelatorio from "../ModalRelatorio"
import { useFetch } from "@/hooks/useFetch"
import { v4 } from 'uuid'
import { ChevronDownIcon } from "lucide-react"

export interface ListRelatoriosProps {
    congregationId: string
}


export default function ListRelatorios(props: ListRelatoriosProps) {
    const { data } = useFetch<IPublisher[]>(`/publishers/congregationId/${props.congregationId}`)

    const [relatorios, setRelatorios] = useState<IReports[]>()
    const [relatoriosFiltrados, setRelatoriosFiltrados] = useState<IReports[]>([])
    const [modalRelatoriosShow, setModalRelatoriosShow] = useState(false)

    const [relatoriosFalta, setRelatoriosFalta] = useState<IPublisher[] | undefined>()
    const [relatoriosFaltaShow, setRelatoriosFaltaShow] = useState(false)

    const [publishers, setPublishers] = useState<IPublisher[]>()

    const [loading, setLoading] = useState(true)

    const [anoServicoAtual, setAnoServicoAtual] = useState<string[]>()
    const [anoServicoAnterior, setAnoServicoAnterior] = useState<string[]>()
    const [exibirMes, setExibirMes] = useState('')
    const [anoSelecionado, setAnoSelecionado] = useState('')
    const [mesSelecionado, setMesSelecionado] = useState('')

    useEffect(() => {
        setPublishers(data)
    }, [data])

    useEffect(() => {
        let dividirPalavra = exibirMes.split(" ")
        setMesSelecionado(dividirPalavra[0])
        setAnoSelecionado(dividirPalavra[1])
    }, [exibirMes])

    useEffect(() => {
        const relatoriosNaoEnviados: IPublisher[] = publishers?.filter((publisher) => {
            const relatorioEnviado = relatoriosFiltrados?.some(
                (relatorio) =>
                    relatorio.publisher.id === publisher.id &&
                    relatorio.month.toLowerCase() === mesSelecionado &&
                    relatorio.year === anoSelecionado
            )
            return !relatorioEnviado
        }) || []
        setRelatoriosFalta(relatoriosNaoEnviados)
    }, [mesSelecionado, anoSelecionado, publishers, relatoriosFiltrados])

    const relatoriosNaoEnviadosCount = relatoriosFalta?.length || 0

    useEffect(() => {
        const relatoriosFiltrados = relatorios?.filter(relatorio => {
            return relatorio.month.toLocaleLowerCase() === mesSelecionado && relatorio.year === anoSelecionado
        })
        if (relatoriosFiltrados) {
            setRelatoriosFiltrados(relatoriosFiltrados)
        }
    }, [mesSelecionado, anoSelecionado, setRelatoriosFiltrados, relatorios])

    useEffect(() => {
        setAnoServicoAtual(obterUltimosMeses().anoCorrente)
        setAnoServicoAnterior(obterUltimosMeses().anoAnterior)
    }, [])

    const getRelatorios = useCallback(async () => {
        await api.get(`/reports/${props.congregationId}`).then(res => {
            const { data } = res
            setRelatorios([...data])
            setLoading(false)
        }).catch(err => console.log(err))
    }, [props.congregationId])

    useEffect(() => {
        setLoading(true)
        getRelatorios()
    }, [getRelatorios])

    return (
        <section className="flex flex-col">
            {modalRelatoriosShow &&
                <div className="flex items-center w-full p-1 bg-gray-200 ">
                    <span onClick={() => { setModalRelatoriosShow(false) }} className="rotate-90 cursor-pointer">
                        <ChevronDownIcon color="#178582" />
                    </span>
                    <span onClick={() => { setModalRelatoriosShow(false) }} className="text-sm font-semi-bold text-primary-200 hover:underline cursor-pointer">Todos os meses</span>
                </div>}
            <h1 className="flex flex-1 pl-5 pt-5 text-2xl text-fontColor-200 font-semibold ">Relatórios</h1>
            <div className="flex justify-evenly items-baseline">
                {!modalRelatoriosShow ? (
                    <>
                        <ul className="flex flex-wrap justify-start w-5/12 items-center p-5">
                            <span className="w-full py-5 text-xl text-fontColor-100">Ano de serviço atual</span>
                            {anoServicoAtual?.map(mes =>
                                <li onClick={() => {
                                    setExibirMes(mes)
                                    setModalRelatoriosShow(true)
                                }} key={mes} className={`flex justify-between items-center w-full bg-white hover:bg-sky-100 cursor-pointer m-1 h-14 p-5 text-primary-200 font-semibold`}>
                                    {mes}
                                </li>)
                            }
                        </ul>
                        <ul className="flex flex-wrap justify-start w-5/12 items-center p-5">
                            <span className="w-full py-5 text-xl text-fontColor-100">Ano de serviço anterior</span>
                            {anoServicoAnterior?.map(mes =>
                                <li onClick={() => {
                                    setExibirMes(mes)
                                    setModalRelatoriosShow(true)
                                }} key={mes} className={`flex justify-between items-center w-full bg-white hover:bg-sky-100 cursor-pointer m-1 h-14 p-5 text-primary-200 font-semibold`}>
                                    {mes}
                                </li>)}
                        </ul>
                    </>
                ) : (
                    <>
                        <section className="flex flex-col flex-wrap w-full">
                            <h2 className="flex flex-1  justify-center font-semibold py-5 text-center">{`${exibirMes.toLocaleUpperCase()}`}</h2>
                            <div className="flex flex-col mx-5">
                                <span className="flex items-center justify-end  text-primary-200 font-bold">
                                    <span className={` ${relatoriosFaltaShow && 'rotate-180'} mr-1  cursor-pointer `} onClick={() => setRelatoriosFaltaShow(!relatoriosFaltaShow)}><ChevronDownIcon color="#178582" /></span>
                                    {`Relatórios em falta:`}
                                    <span className="text-primary-200 font-semibold pl-2">{relatoriosNaoEnviadosCount}</span>
                                </span>
                                <div className="w-10/12 my-4 self-center flex flex-wrap justify-between">
                                    {relatoriosFalta?.map(relatorio =>
                                        <span key={v4()} className={`${!relatoriosFaltaShow && "hidden"} w-1/3 text-primary-200 font-semibold`}>{relatorio.fullName}
                                        </span>)}
                                </div>
                            </div>
                            {relatoriosFiltrados?.length > 1 ? (
                                <ul className="flex flex-wrap justify-evenly">
                                    {relatoriosFiltrados?.map(report =>
                                        <ModalRelatorio
                                            key={v4()}
                                            publisher={report.publisher}
                                            month={report.month}
                                            year={report.year}
                                            publications={report.publications}
                                            videos={report.videos}
                                            hours={report.hours}
                                            revisits={report.revisits}
                                            studies={report.studies}
                                            observations={report.observations}
                                        />)}
                                </ul>
                            ) : (
                                <div className="m-auto mt-4">Nenhum relatório registrado nesse mês</div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </section>
    )
}
