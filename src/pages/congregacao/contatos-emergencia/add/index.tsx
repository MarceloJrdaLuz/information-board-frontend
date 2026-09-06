import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddEmergencyContact from "@/Components/Forms/FormAddEmergencyContact"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddEmergencyContactPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Criar Contato")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Contatos de emergência", link: "/congregacao/contatos-emergencia" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Criar Contato"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddEmergencyContact congregation_id={congregation_id ?? ""} />
            </section>
        </ContentDashboard>
    )
}

AddEmergencyContactPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default AddEmergencyContactPage