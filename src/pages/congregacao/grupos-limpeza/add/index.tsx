import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddCleaningGroup from "@/Components/Forms/FormAddCleaningGroup"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddCleaningGroupPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs(prev => [...prev, {
            label: "Grupos de limpeza",
            link: "/congregacao/grupos-limpeza"
        }])

        return () => {
            setCrumbs(prev => prev.slice(0, -1))
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive("Criar grupo de limpeza")
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Adicionar Grupo" />
            <section className="flex m-10 justify-center items-center">
                <FormAddCleaningGroup />
            </section>
        </ContentDashboard>
    )
}

AddCleaningGroupPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "CLEANING_MANAGER"])

export default AddCleaningGroupPage
