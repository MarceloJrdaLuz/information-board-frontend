import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditRole from "@/Components/Forms/FormEditRole"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'

function EditRolesPage() {
    const router = useRouter()
    const { id } = router.query
    const methods = useForm()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Função")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Funções", link: "/administracao/funcoes" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Função"} />
            <FormProvider {...methods}>
                <section className="flex justify-center">
                    <FormEditRole role_id={`${id}`} />
                </section>
            </FormProvider>
        </ContentDashboard>
    )
}

EditRolesPage.getLayout = withProtectedLayout(["ADMIN"])

export default EditRolesPage