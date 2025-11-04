import S88 from "@/Components/AssistanceCard"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import PdfIcon from "@/Components/Icons/PdfIcon"
import Layout from "@/Components/Layout"
import ListMeetingAssistance from "@/Components/ListMeetingAssistance"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { getYearService } from "@/functions/meses"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IMeetingAssistance } from "@/types/types"
import { Document, PDFDownloadLink } from "@react-pdf/renderer"
import { useAtom } from "jotai"
import { FilePlus2Icon } from "lucide-react"
import moment from "moment"
import 'moment/locale/pt-br'
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function ListarRelatorios() {
    const { roleContains } = useAuthContext()
    const router = useRouter()
    const { congregationId } = router.query
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [meetingAssistance, setMeetingAssistance] = useState<IMeetingAssistance[]>([])
    const [pdfGenerating, setPdfGenerating] = useState(false)
    const [yearService,] = useState(getYearService().toString())
    const [yearServiceSelected, setYearServiceSelected] = useState(getYearService().toString())

    useEffect(() => {
        setPdfGenerating(true)
    }, [])

    useEffect(() => {
        setPageActive('Assistência')
    }, [setPageActive])

    const fetch = congregationId ? `/assistance/${congregationId}` : ""
    const { data } = useAuthorizedFetch<IMeetingAssistance[]>(`/assistance/${congregationId}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "ASSISTANCE_MANAGER", "ASSISTANCE_VIEWER"]
    })

    useEffect(() => {
        if (data) {
            const sortedMeetingAssistance = data.sort((a, b) => {
                const dateA = moment(`${a.year}-${moment().month(a.month).format('MM')}`, 'YYYY-MM')
                const dateB = moment(`${b.year}-${moment().month(b.month).format('MM')}`, 'YYYY-MM')
                return dateB.diff(dateA)
            })
            setMeetingAssistance(sortedMeetingAssistance)
        }
    }, [data])

    const PdfLinkComponent = () => (
        <PDFDownloadLink
            document={
                <Document>
                    <S88
                        meetingAssistance={data}
                        yearsServices={[yearServiceSelected, (Number(yearServiceSelected) - 1).toString()]}
                    />
                </Document>
            }
            fileName={"Assistência às reuniões.pdf"}
        >
            {({ blob, url, loading, error }) =>
                loading ? "" :
                    <Button className="bg-white text-primary-200 p-1 md:p-3 border-gray-300 rounded-none hover:opacity-80">
                        <PdfIcon />
                        <span className="text-primary-200 font-semibold">
                            Salvar S-88
                        </span>
                    </Button>
            }
        </PDFDownloadLink>
    )
    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "ASSISTANCE_MANAGER", "ASSISTANCE_VIEWER"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Assistência às reuniões</h1>
                            <div className="flex justify-between">
                                {(roleContains("ASSISTANCE_MANAGER") || roleContains("ADMIN_CONGREGATION")) && (
                                    <Button
                                        onClick={() => {
                                            router.push(`/congregacao/assistencia/${congregationId}/enviar`)
                                        }}
                                        className="bg-white text-primary-200 p-1 md:p-3 border-gray-300 rounded-none hover:opacity-80">
                                        <FilePlus2Icon />
                                        <span className="text-primary-200 font-semibold">Adicionar</span>
                                    </Button>
                                )}
                                {pdfGenerating && <PdfLinkComponent />}
                            </div>
                            <Dropdown textSize="md" textAlign="left" notBorderFocus selectedItem={yearServiceSelected} handleClick={(select) => setYearServiceSelected(select)} textVisible title="Ano de Serviço" options={[yearService, (Number(yearService) - 1).toString(), (Number(yearService) - 2).toString()]} />

                            <ListMeetingAssistance yearService={yearServiceSelected} items={meetingAssistance} />
                        </div>
                    </section>
                </ContentDashboard>
        </ProtectedRoute>
    )
}