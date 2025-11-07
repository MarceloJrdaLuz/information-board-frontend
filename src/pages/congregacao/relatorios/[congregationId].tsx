import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import ListRelatorios from "@/Components/ListMonths"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function ListReportsPage() {
    const router = useRouter()
    const { congregationId } = router.query

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Relatórios')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Relatórios"} />
            <ListRelatorios congregationId={congregationId as string} />
        </ContentDashboard>
    )
}

ListReportsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "REPORTS_MANAGER", " REPORTS_VIEWER"])

export default ListReportsPage