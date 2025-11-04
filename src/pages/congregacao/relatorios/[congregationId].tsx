import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListRelatorios from "@/Components/ListMonths"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function ListarRelatorios() {
    const router = useRouter()
    const { congregationId } = router.query

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Relatórios')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "REPORTS_MANAGER", " REPORTS_VIEWER"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <ListRelatorios congregationId={congregationId as string} />
                </ContentDashboard>
        </ProtectedRoute>
    )
}