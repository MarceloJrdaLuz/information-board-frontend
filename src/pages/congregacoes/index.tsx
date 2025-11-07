import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import ListCongregations from "@/Components/ListCongregations"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ICongregation } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

function SystemCongregationsPage() {
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
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Congregações do Sistema"} />
            <ListCongregations isLoading={isLoading} congregations={congregations ?? []} />
        </ContentDashboard>
    )
}

SystemCongregationsPage.getLayout = withProtectedLayout(["ADMIN"])

export default SystemCongregationsPage
