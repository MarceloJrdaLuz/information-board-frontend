import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditCleaningGroup from "@/Components/Forms/FormEditCleaningGroup"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function EditCleaningGroupPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    const router = useRouter()
    const { id: group_id } = router.query

    useEffect(() => {
        setCrumbs(prev => [...prev, {
            label: "Grupos de limpeza",
            link: "/congregacao/grupos-limpeza"
        }])

        return () => setCrumbs(prev => prev.slice(0, -1))
    }, [setCrumbs])

    useEffect(() => {
        setPageActive("Editar grupo de limpeza")
    }, [setPageActive])

    if (!group_id) return null

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Editar Grupo" />
            <section className="flex m-10 justify-center items-center">
                <FormEditCleaningGroup group_id={String(group_id)} />
            </section>
        </ContentDashboard>
    )
}

EditCleaningGroupPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "CLEANING_MANAGER"])

export default EditCleaningGroupPage
