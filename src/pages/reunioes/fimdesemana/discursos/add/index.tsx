import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddTalk from "@/Components/Forms/FormAddTalk"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddTalkPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Adicionar Discurso")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Discursos", link: "/reunioes/fimdesemana/discursos" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar Discurso"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddTalk />
            </section>
        </ContentDashboard>
    )
}

AddTalkPage.getLayout = withProtectedLayout(["ADMIN"])

export default AddTalkPage