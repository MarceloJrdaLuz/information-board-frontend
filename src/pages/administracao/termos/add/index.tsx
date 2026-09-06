import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddTermOfUse from "@/Components/Forms/FormAddTermOfUse"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddTermPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Criar Termo")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Termos de Uso", link: "/administracao/termos" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Termo"} />
            <section className="flex justify-center">
                <FormAddTermOfUse />
            </section>
        </ContentDashboard>
    )
}

AddTermPage.getLayout = withProtectedLayout(["ADMIN"])

export default AddTermPage