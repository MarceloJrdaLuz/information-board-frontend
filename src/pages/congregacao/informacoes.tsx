import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormUpdateCongregation from "@/Components/Forms/FormUpdateCongregation"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import { useEffect } from "react"

export default function InformacoesCongregacoes() {
    const [crumbs, ] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Informações da congregação')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION"]}>
            <Layout pageActive="informacoes-congregacoes">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <div className="flex justify-center items-center py-5">
                        <FormUpdateCongregation />
                    </div>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>
    )
}