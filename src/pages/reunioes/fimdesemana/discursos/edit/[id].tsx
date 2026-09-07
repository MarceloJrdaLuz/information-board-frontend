import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditTalk from "@/Components/Forms/FormEditTalk"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function EditTalkPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Discurso")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Discursos", link: "/reunioes/fimdesemana/discursos" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Discurso"} />
            <section className="flex justify-center">
                <FormEditTalk />
            </section>
        </ContentDashboard>
    )
}

EditTalkPage.getLayout = withProtectedLayout(["ADMIN"])

export default EditTalkPage