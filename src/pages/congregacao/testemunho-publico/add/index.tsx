import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddPublicWitnessArrangement from "@/Components/Forms/FormAddPublicWitnessArrangement"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddPublicWitnessArrangementPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Adicionar Arranjo")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Testemunho Público", link: "/congregacao/testemunho-publico" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Adicionar Arranjo" />
            <section className="flex m-10 justify-center items-center">
                <FormAddPublicWitnessArrangement />
            </section>
        </ContentDashboard>
    )
}

AddPublicWitnessArrangementPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "PUBLIC_WITNESS_MANAGER"
])

export default AddPublicWitnessArrangementPage
