import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditEmergencyContact from "@/Components/Forms/FormEditEmergencyContact"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'

function EditEmergencyContactPage() {
    const router = useRouter()
    const { id } = router.query
    const methods = useForm()
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Editar Contato")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Contatos de emergência", link: "/congregacao/contatos-emergencia" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Contato"} />
            <FormProvider {...methods}>
                <section className="flex justify-center">
                    <FormEditEmergencyContact emergencyContact={`${id}`} />
                </section>
            </FormProvider>
        </ContentDashboard>
    )
}

EditEmergencyContactPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default EditEmergencyContactPage