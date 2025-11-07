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
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Contatos', link: '/congregacao/contatos-emergencia' }]
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
        setPageActive('Criar Contato de emergência')
    }, [setPageActive])

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