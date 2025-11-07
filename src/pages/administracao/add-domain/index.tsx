import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddDomain from "@/Components/Forms/FormAddDomain"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddDomainPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Adicionar ao domínio')
    }, [setPageActive])

    return (
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar ao Domínio"} />
                <FormAddDomain />
            </ContentDashboard>
    )
}


AddDomainPage.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION"])

export default AddDomainPage