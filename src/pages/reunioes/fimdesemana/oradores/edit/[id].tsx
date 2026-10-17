import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditSpeaker from "@/Components/Forms/FormEditSpeaker"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

import { useRouter } from "next/router"

function EditSpeakerPage() {
    const router = useRouter()
    const speakerId = router.query.id as string
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Orador")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Oradores", link: "/reunioes/fimdesemana/oradores" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Orador"} />
            <section className="flex justify-center">
                <FormEditSpeaker speakerId={speakerId} />
            </section>
        </ContentDashboard>
    )
}

EditSpeakerPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default EditSpeakerPage