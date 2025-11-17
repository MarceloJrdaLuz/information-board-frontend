import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditTerritory from "@/Components/Forms/FormEditTerritory"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { ReactElement, useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'
import TerritoriesProviderLayout from "../_layout"

function EditTerritoryPage() {
    const router = useRouter()
    const { id } = router.query
    const methods = useForm()
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
        setPageActive('Editar Território')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Território"} />
            <FormProvider {...methods}>
                <section className="flex justify-center">
                    <FormEditTerritory territory_id={`${id}`} />
                </section>
            </FormProvider>
        </ContentDashboard>
    )
}

EditTerritoryPage.getLayout = (page: ReactElement) =>
    withProtectedLayout(["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"])(
        <TerritoriesProviderLayout>{page}</TerritoriesProviderLayout>
    )
export default EditTerritoryPage