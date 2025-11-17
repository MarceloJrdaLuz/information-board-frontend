import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddTerritory from "@/Components/Forms/FormAddTerritory"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { ReactElement, useEffect } from "react"
import TerritoriesProviderLayout from "../_layout"

function CreateTerritoryPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Territórios', link: `/congregacao/territorios` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive('Adicionar Território')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Território"} />
            <section className="flex justify-center">
                <FormAddTerritory />
            </section>
        </ContentDashboard>
    )
}

CreateTerritoryPage.getLayout = (page: ReactElement) =>
    withProtectedLayout(["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"])(
        <TerritoriesProviderLayout>{page}</TerritoriesProviderLayout>
    )
    
export default CreateTerritoryPage