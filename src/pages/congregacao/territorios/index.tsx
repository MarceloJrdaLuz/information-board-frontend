import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import PdfIcon from "@/Components/Icons/PdfIcon"
import TerritoryIcon from "@/Components/Icons/TerritoryIcon"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import S13 from "@/Components/S13"
import TerritoriesList from "@/Components/TerritoriesList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useTerritoryContext } from "@/context/TerritoryContext"
import { ITerritoryWithHistories } from "@/types/territory"
import { Document, PDFDownloadLink } from '@react-pdf/renderer'
import { useAtom } from "jotai"
import 'moment/locale/pt-br'
import Router from "next/router"
import { useEffect, useState } from "react"

export default function Territory() {
    const [crumbs, ] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const { territoriesHistory } = useTerritoryContext()
    const [territoriesHistoryFilter, setTerritoriesHistoryFilter] = useState<ITerritoryWithHistories[]>([])

    useEffect(() => {
        setPdfGenerating(true)
    }, [])

    useEffect(() => {
        if (territoriesHistory) {
            const groupedTerritories = territoriesHistory.reduce((acc, history) => {
                const { territory, ...historyData } = history

                if (!acc[territory.id]) {
                    acc[territory.id] = { ...territory, histories: [], last_completion_date: null }
                }

                acc[territory.id].histories.push(historyData)

                return acc
            }, {} as Record<string, ITerritoryWithHistories>)

            // Convertendo para array, ordenando os históricos e pegando a última conclusão
            const territoriesArray: ITerritoryWithHistories[] = Object.values(groupedTerritories).map(territory => {
                // Ordenar históricos pela completion_date mais recente
                const sortedHistories = territory.histories
                    .sort((a, b) =>
                        (b.completion_date ? new Date(b.completion_date).getTime() : 0) -
                        (a.completion_date ? new Date(a.completion_date).getTime() : 0)
                    )
                    .slice(0, 4) // Pega no máximo 4 históricos

                // Determinar a última data de conclusão
                const lastCompletionDate = sortedHistories.find(h => h.completion_date)?.completion_date || null

                return {
                    ...territory,
                    histories: sortedHistories, // Apenas os 4 mais recentes
                    last_completion_date: lastCompletionDate
                }
            })

            territoriesArray.sort((a, b) => a.number - b.number)

            setTerritoriesHistoryFilter(territoriesArray)
        }
    }, [territoriesHistory])


    useEffect(() => {
        setPageActive('Territórios')
    }, [setPageActive])


    const PdfLinkComponent = () => (
        <PDFDownloadLink
            document={
                <Document>
                    <S13 territoriesHistory={territoriesHistoryFilter ?? []} />
                </Document>
            }
            fileName={"S-13.pdf"}
        >
            {({ blob, url, loading, error }) => {
                return loading ? "" :
                    <Button className="bg-white text-primary-200 p-1 md:p-3 border-gray-300 rounded-none hover:opacity-80">
                        <PdfIcon />
                        <span className="text-primary-200 font-semibold">
                            Salvar S-13
                        </span>
                    </Button>
            }
            }
        </PDFDownloadLink>
    )

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "TERRITORIES_MANAGER", "TERRITORIES_VIEWER"]}>
            <Layout pageActive="territorios">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Registros de territórios</h1>
                        <Button
                            onClick={() => {
                                Router.push('/congregacao/territorios/add')
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <TerritoryIcon />
                            <span className="text-primary-200 font-semibold">Adicionar território</span>
                        </Button>
                        <div className="w-full h-full my-5">
                            <div className="w-full flex justify-end">
                                {pdfGenerating && <PdfLinkComponent />}
                            </div>
                            <TerritoriesList />
                        </div>
                        {/* <div className="w-screen">
                        {isClient && (
                            <PDFViewer>
                                <S13 territoriesHistory={territoriesHistoryFilter ?? []} />
                            </PDFViewer>
                        )}
                    </div> */}
                    </section>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>
    )
}