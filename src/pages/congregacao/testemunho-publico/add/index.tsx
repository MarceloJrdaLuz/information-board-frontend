import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddPublicWitnessArrangement from "@/Components/FormAddPublicWitnessArrangement"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddPublicWitnessArrangementPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs(prev => [
            ...prev,
            {
                label: "Testemunho Público - Arranjos",
                link: "/congregacao/testemunho-publico"
            }
        ])

        return () => setCrumbs(prev => prev.slice(0, -1))
    }, [setCrumbs])

    useEffect(() => {
        setPageActive("Adicionar arranjo")
    }, [setPageActive])

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
