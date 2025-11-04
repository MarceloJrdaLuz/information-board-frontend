import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddDomain from "@/Components/Forms/FormAddDomain"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { useAtom } from "jotai"
import { useEffect } from "react"

export default function AddDomain() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Adicionar ao domínio')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN", "ADMIN_CONGREGATION"]}>
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar ao Domínio"} />
                <FormAddDomain />
            </ContentDashboard>
        </ProtectedRoute>
    )
}