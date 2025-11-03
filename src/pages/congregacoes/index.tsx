import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListCongregations from "@/Components/ListCongregations"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ICongregation } from "@/types/types"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

export default function Congregacoes() {
    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Congregações')
    }, [setPageActive])

    const { data: congregationsData, isLoading } = useAuthorizedFetch<ICongregation[]>('/congregations', {
        allowedRoles: ['ADMIN']
    })

    useEffect(() => {
        if (congregationsData) setCongregations(congregationsData)
    }, [congregationsData])

    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout pageActive="congregacoes">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <ListCongregations isLoading={isLoading} congregations={congregations ?? []} />
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>
    )
}
