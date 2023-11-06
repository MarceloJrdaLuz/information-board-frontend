import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { meses } from "@/functions/meses"
import { useRouter } from "next/router"
import { useFetch } from "@/hooks/useFetch"
import { IPublisher, IReports, Privileges } from "@/entities/types"
import { Document, PDFDownloadLink } from '@react-pdf/renderer'
import { api } from "@/services/api"
import Layout from "@/Components/Layout"
import ContentDashboard from "@/Components/ContentDashboard"
import Button from "@/Components/Button"
import { useAtom } from "jotai"
import { crumbsAtom, pageActiveAtom, selectedPublishersToS21Atom } from "@/atoms/atom"
import PublishersToGenerateS21 from "@/Components/PublishersToGenerateS21"
import ModalHelp from "@/Components/ModalHelp"
import { HelpCircle } from "lucide-react"
import Dropdown from "@/Components/Dropdown"
import FilterPrivileges from "@/Components/FilterPrivileges"
import FilterGroups from "@/Components/FilterGroups"
import S21 from "@/Components/PublisherCard"
import { sortArrayByProperty } from "@/functions/sortObjects"
import PdfIcon from "@/Components/Icons/PdfIcon"
import BreadCrumbs from "@/Components/BreadCrumbs"
import SkeletonPublishersList from "@/Components/PublishersToGenerateS21/skeletonPublishersList"


export default function PublisherCard() {
    const router = useRouter()
    const { congregationId } = router.query
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const fetchConfig = congregationId ? `/publishers/congregationId/${congregationId}` : ""
    const { data } = useFetch<IPublisher[]>(fetchConfig)

    const [selectedPublishersToS21, setSelectedPublishersToS21] = useAtom(selectedPublishersToS21Atom)

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [filterPublishers, setfilterPublishers] = useState<IPublisher[]>()
    const [reports, setReports] = useState<IReports[]>()
    const [reportsFiltered, setReportsFiltered] = useState<IReports[]>([])
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])
    const [modalHelpShow, setModalHelpShow] = useState(false)
    const [yearService, setYearService] = useState(new Date().getFullYear().toString())
    const [groupSelecteds, setGroupSelecteds] = useState<string[]>([])
    const [pdfGenerating, setPdfGenerating] = useState(false)

    useEffect(() => {
        setPageActive("Registros")
    }, [setPageActive])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Relatórios', link: `/relatorios/${congregationId}` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, setPageActive, congregationId])

    let skeletonPublishersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonPublishersList.map((a, i) => (<SkeletonPublishersList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    const sortedData = useMemo(() => {
        if (data) {
            return sortArrayByProperty(data, "fullName")
        }
        return []
    }, [data])

    useEffect(() => {
        if (sortedData) {
            setPublishers(sortedData)
            setfilterPublishers(sortedData)
            sortedData?.map(publisher => setSelectedPublishersToS21(prev => [...prev, publisher.id]))
        }
    }, [sortedData, setPublishers, setfilterPublishers, setSelectedPublishersToS21])

    useEffect(() => {
        if (publishers) {
            const filteredPublishers = publishers.filter(publisher => {

                const belongsToSelectedGroups = groupSelecteds.length === 0 ||
                    groupSelecteds.includes(publisher.group.id)
                filterPrivileges.some(privilege => {
                    return publisher.privileges.includes(privilege)
                })
                const hasSelectedPrivileges = filterPrivileges.length === 0 ||
                    filterPrivileges.some(privilege => publisher.privileges.includes(privilege))

                return belongsToSelectedGroups && hasSelectedPrivileges
            })

            if (filteredPublishers) {
                const publishersIds: string[] = []
                filteredPublishers.map(publisher => publishersIds.push(publisher.id))
                setSelectedPublishersToS21(publishersIds)
            }
        }
    }, [filterPrivileges, groupSelecteds, publishers, setSelectedPublishersToS21])

    useEffect(() => {
        if (publishers && selectedPublishersToS21) {
            const filter = publishers?.filter(publisher =>
                selectedPublishersToS21.includes(publisher.id)
            )
            setfilterPublishers(filter)
        }
    }, [publishers, selectedPublishersToS21])

    const getRelatorios = useCallback(async () => {
        if (congregationId) {
            await api.get(`/reports/${congregationId}`).then(res => {
                const { data } = res
                setReports([...data])
            }).catch(err => console.log(err))
        }
    }, [congregationId])

    useEffect(() => {
        getRelatorios()
    }, [getRelatorios])

    useEffect(() => {
        if (filterPublishers && reports) {
            const reportsFilteredByPublisher = reports.filter(report => {
                return filterPublishers.some(publisher => {
                    return report.publisher.id === publisher.id &&
                        report.year === yearService
                })
            })
            if (reportsFilteredByPublisher) {
                setReportsFiltered(reportsFilteredByPublisher)
            }
        }
    }, [reports, filterPublishers, yearService])

    const handleCheckboxChange = (filter: string[]) => {
        if (filter.includes(Privileges.PIONEIROAUXILIAR)) {
            setFilterPrivileges([...filter, Privileges.AUXILIARINDETERMINADO])
        } else {
            setFilterPrivileges(filter)
        }
    }

    const handleCheckboxGroupsChange = (filter: string[]) => {
        setGroupSelecteds(filter)
    }
    useEffect(() => {

    }, [yearService])

    const PdfLinkComponent = () => (
        <PDFDownloadLink
            document={
                <Document>
                    {filterPublishers && filterPublishers.length > 0 &&
                        filterPublishers.map((publisher, index) => {
                            const reports = reportsFiltered.filter(report => report.publisher.id === publisher.id)
                            return (
                                (
                                    <S21
                                        key={index}
                                        publisher={publisher}
                                        serviceYear={yearService}
                                        months={meses}
                                        reports={reports}
                                    />
                                )
                            )
                        })}
                </Document>
            }
            fileName={filterPublishers && filterPublishers?.length === 1 ? `${filterPublishers[0].fullName}.pdf` : "Registros de publicadores.pdf"}
        >
            {({ blob, url, loading, error }) =>
                loading ? "" :
                    <Button className="my-3 bg-white font-semibold text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                        Salvar S-21
                        <PdfIcon />

                    </Button>
            }
        </PDFDownloadLink>
    )


    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-col justify-center items-center p-5">
                    <div className="flex justify-between w-full mt-5 ">
                        <h2 className="text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold mb-4">Registro de publicadores</h2>
                        <HelpCircle onClick={() => setModalHelpShow(!modalHelpShow)} className="text-primary-200 cursor-pointer" />
                    </div>
                    {publishers && (
                        <div className="w-full md:w-9/12">
                            <div>
                                {modalHelpShow &&
                                    <ModalHelp
                                        onClick={() => setModalHelpShow(false)}
                                        title="Como gerar os registros de publicadores (S-21)"
                                        text={
                                            `  
    Na lista abaixo aparece todos os publicadores da congregação. Por padrão eles vem todos selecionados, fazendo com que seja gerado um Pdf como todos os publicadores.
                                            
    No botao de filtro você escolher para filtrar pelos privilégios. Ex: selecionando Ancião e Servo, ele selecionará apenas os registros de anciãos e servos. Você também escolher um privilégio, e ainda acrescentar manualmente mais alguns publicadores clicando no nome deles na lista.
                                            
    Caso queira criar um registro para cada publicador individualmente, pode ir selecionando o nome na lista e clicar no botão Gerar S-21. Se o botão Gerar S-21 não estiver aparecendo é por que nenhum publicador está selecionado.`} />}
                            </div>
                            <div className="flex justify-between items-center w-full mb-4">
                                <div className="flex flex-col">
                                    <Dropdown textSize="md" textAlign="left" notBorderFocus selectedItem={yearService} handleClick={(select) => setYearService(select)} textVisible title="Ano de Serviço" options={[`${new Date().getFullYear()}`, `${new Date().getFullYear() - 1}`]} />
                                    {pdfGenerating && filterPublishers && filterPublishers.length > 0 ?
                                        <PdfLinkComponent />
                                        :
                                        <Button className="my-3 bg-white font-semibold text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80" onClick={() => setPdfGenerating(true)}>
                                            Preparar registros
                                        </Button>}
                                </div>
                                <div className="flex gap-1">
                                    <FilterGroups checkedOptions={groupSelecteds} congregation_id={congregationId as string} handleCheckboxChange={(groups) => handleCheckboxGroupsChange(groups)} />

                                    <FilterPrivileges checkedOptions={filterPrivileges} handleCheckboxChange={(filters) => handleCheckboxChange(filters)} />
                                </div>
                            </div>
                            {publishers.length > 0 ? (
                                publishers?.map(publisher => <PublishersToGenerateS21 key={publisher.id} publisher={publisher} />)
                            ) : (
                                renderSkeleton()
                            )}
                        </div>
                    )}
                </section>
            </ContentDashboard>
        </Layout>
    )
}
