import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import MissingReportsModal from "@/Components/MissingReportsModal"
import ModalRelatorio from "@/Components/ModalRelatorio"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { IPublisher, IReports } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useCallback, useContext, useEffect, useState } from "react"
import { v4 } from "uuid"

export default function RelatorioMes() {

    const router = useRouter()
    const { month, congregationId } = router.query

    const { data } = useFetch<IPublisher[]>(`/publishers/congregationId/${congregationId}`)

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const [reports, setReports] = useState<IReports[]>()
    const [reportsFiltered, setReportsFiltered] = useState<IReports[]>([])

    const [publishers, setPublishers] = useState<IPublisher[]>()

    const [missingReports, setMissingReports] = useState<IPublisher[] | undefined>()

    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')

    const monthParam = month as string

    useEffect(() => {
        setPublishers(data)
    }, [data])

    useEffect(() => {
        setPageActive(monthParam)
        let dividirPalavra = monthParam.split(" ")
        setMonthSelected(dividirPalavra[0])
        setYearSelected(dividirPalavra[1])
    }, [monthParam, setPageActive])

    useEffect(() => {
        const relatoriosNaoEnviados: IPublisher[] = publishers?.filter((publisher) => {
            const relatorioEnviado = reportsFiltered?.some(
                (relatorio) =>
                    relatorio.publisher.id === publisher.id &&
                    relatorio.month.toLowerCase() === monthSelected &&
                    relatorio.year === yearSelected
            )
            return !relatorioEnviado
        }) || []
        setMissingReports(relatoriosNaoEnviados)
    }, [monthSelected, yearSelected, publishers, reportsFiltered])

    const relatoriosNaoEnviadosCount = missingReports?.length || 0

    useEffect(() => {
        const reportsFiltered = reports?.filter(relatorio => {
            return relatorio.month.toLocaleLowerCase() === monthSelected && relatorio.year === yearSelected
        })
        if (reportsFiltered) {
            setReportsFiltered(reportsFiltered)
        }
    }, [monthSelected, yearSelected, setReportsFiltered, reports])

    const getRelatorios = useCallback(async () => {
        await api.get(`/reports/${congregationId}`).then(res => {
            const { data } = res
            setReports([...data])
        }).catch(err => console.log(err))
    }, [congregationId])

    useEffect(() => {
        getRelatorios()
    }, [getRelatorios])

    useEffect(() => {
        console.log(reports)
    }, [reports])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Todos os meses', link: `/relatorios/${congregationId}` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, setPageActive, monthSelected, congregationId])

    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <>
                    <section className="flex flex-col flex-wrap w-full">
                        <h2 className="flex flex-1  justify-center font-semibold py-5 text-center">{`${monthParam.toLocaleUpperCase()}`}</h2>
                        <div className="flex flex-col mx-5">
                            <MissingReportsModal missingReportsNumber={relatoriosNaoEnviadosCount} missingReports={missingReports}/>
                            
                        </div>
                        {reportsFiltered?.length > 0 ? (
                            <ul className="flex flex-wrap justify-evenly">
                                {reportsFiltered?.map(report =>
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
            </ContentDashboard>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}