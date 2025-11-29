import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddCongregation from "@/Components/Forms/FormAddCongregation"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddSystemCongregationsPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Congregações')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar congregação"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddCongregation />
            </section>
        </ContentDashboard>
    )
}

AddSystemCongregationsPage.getLayout = withProtectedLayout(["ADMIN"])

export default AddSystemCongregationsPage
