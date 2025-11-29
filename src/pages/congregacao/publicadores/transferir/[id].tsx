import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddPublisher from "@/Components/Forms/FormAddPublisher"
import FormTransferPublisher from "@/Components/Forms/FormTransferPublisher"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPublisher } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function TransferPublishersPage() {
    const router = useRouter()
    const { id } = router.query
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: publishers } = useAuthorizedFetch<IPublisher[]>(`${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}`, {
        allowedRoles: ["ADMIN_CONGREGATION"]
    })

    const filteredPublisherSelected = publishers?.find(p => p.id === id)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Publicadores', link: '/congregacao/publicadores' }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive('Transferir publicador')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Transferir Publicador"} />
            <section className="flex justify-center">
                {publishers && filteredPublisherSelected && <FormTransferPublisher allPublishers={publishers} initialPublisher={filteredPublisherSelected} />}
            </section>
        </ContentDashboard>
    )
}

TransferPublishersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default TransferPublishersPage