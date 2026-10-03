import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditPublisher from "@/Components/Forms/FormEditPublisher"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function EditPublishersPage() {
    const router = useRouter()
    const { id } = router.query
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Pessoa")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Pessoas", link: "/congregacao/pessoas" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Pessoa"} />
            <div className="flex justify-center w-full">
                <FormEditPublisher id={`${id}`} />
            </div>
        </ContentDashboard>
    )
}

EditPublishersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default EditPublishersPage