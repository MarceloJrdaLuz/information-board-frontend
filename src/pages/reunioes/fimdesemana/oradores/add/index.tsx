import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddSpeaker from "@/Components/Forms/FormAddSpeaker"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddSpeakerPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Adicionar Orador")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Oradores", link: "/reunioes/fimdesemana/oradores" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar Orador"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddSpeaker />
            </section>
        </ContentDashboard>
    )
}

AddSpeakerPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default AddSpeakerPage