import S88 from "@/Components/AssistanceCard"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import PdfIcon from "@/Components/Icons/PdfIcon"
import ListMeetingAssistance from "@/Components/ListMeetingAssistance"
import SkeletonAssistanceList from "@/Components/ListMeetingAssistance/skeletonAssistanceList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { getYearService } from "@/functions/meses"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IMeetingAssistance } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { BlobProvider, Document, PDFDownloadLink } from "@react-pdf/renderer"
import { useAtom } from "jotai"
import { FilePlus2Icon } from "lucide-react"
import moment from "moment"
import 'moment/locale/pt-br'
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function ListReportsPage() {
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
    const { data, isLoading } = useAuthorizedFetch<IMeetingAssistance[]>(`/assistance/${congregationId}`, {
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

    let skeletonAssistanceList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonAssistanceList.map((a, i) => (<SkeletonAssistanceList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    const PdfLinkComponent = () => (
        <BlobProvider
            document={
                <Document>
                    <S88
                        meetingAssistance={data}
                        yearsServices={[yearServiceSelected, (Number(yearServiceSelected) - 1).toString()]}
                    />
                </Document>
            }
        >
            {({ blob, url, loading, error }) => (
                <a href={url ?? "#"} download={"Assistência às reuniões.pdf"}>
                    <Button
                        outline
                        className="text-primary-200 p-1 md:p-3 border-typography-300 rounded-none"
                    >
                        <PdfIcon />
                        <span className="text-primary-200 font-semibold">
                            {loading ? "Gerando PDF..." : "Salvar S-88"}
                        </span>
                    </Button>
                </a>
            )}
        </BlobProvider>
    );

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Assistência"} />
            <section className="flex flex-wrap w-full h-full p-5">
                <div className="w-full h-full">
                    <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Assistência às reuniões</h1>
                    <div className="flex justify-between flex-wrap gap-2">
                        {(roleContains("ASSISTANCE_MANAGER") || roleContains("ADMIN_CONGREGATION")) && (
                            <Button
                                outline
                                onClick={() => {
                                    router.push(`/congregacao/assistencia/${congregationId}/enviar`)
                                }}
                                className="text-primary-200 p-1 md:p-3 border-typography-300 rounded-none">
                                <FilePlus2Icon />
                                <span className="text-primary-200 font-semibold">Adicionar</span>
                            </Button>
                        )}
                        {pdfGenerating && <PdfLinkComponent />}
                    </div>
                    <Dropdown textSize="md" notBorderFocus selectedItem={yearServiceSelected} handleClick={(select) => setYearServiceSelected(select)} textVisible title="Ano de Serviço" options={[yearService, (Number(yearService) - 1).toString(), (Number(yearService) - 2).toString()]} />
                    {isLoading || !data || data === undefined ?
                        (
                            renderSkeleton()
                        ) : (
                            <ListMeetingAssistance yearService={yearServiceSelected} items={meetingAssistance} />
                        )}
                </div>
            </section>
        </ContentDashboard>
    )
}

ListReportsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "ASSISTANCE_MANAGER", "ASSISTANCE_VIEWER"])

export default ListReportsPage