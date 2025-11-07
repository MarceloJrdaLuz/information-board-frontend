import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormUpdateCongregation from "@/Components/Forms/FormUpdateCongregation"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function InfoCongregationPage() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Informações da congregação')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Informações da Congregação"} />
            <div className="flex justify-center items-center py-5">
                <FormUpdateCongregation />
            </div>
        </ContentDashboard>
    )
}

InfoCongregationPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"])

export default InfoCongregationPage