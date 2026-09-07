import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import PublisherListReports from "@/Components/PublishersListReports"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function InsertReportPage() {
    const router = useRouter()
    const { month, congregationId } = router.query

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Inserir Relatório")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Relatórios", link: `/congregacao/relatorios/${congregationId}` },
            { label: `${capitalizeFirstLetter(month as string)}`, link: `/congregacao/relatorios/${congregationId}/${month}` }
        ])
    }, [setCrumbs, setPageActive, congregationId, month])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Inserir Relatório"} />
            <PublisherListReports />
        </ContentDashboard>
    )
}

InsertReportPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "REPORTS_MANAGER", " REPORTS_VIEWER"])

export default InsertReportPage