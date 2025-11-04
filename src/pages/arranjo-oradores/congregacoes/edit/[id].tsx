import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditCongregationAuxiliary from "@/Components/Forms/FormEditCongregationAuxiliary"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import { useEffect } from "react"

export default function EditCongregationPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Congregações', link: '/arranjo-oradores/congregacoes' }]
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
        setPageActive('Editar congregação')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "TALK_MANAGER"]}>
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex justify-center">
                    <FormEditCongregationAuxiliary />
                </section>
            </ContentDashboard>
        </ProtectedRoute>
    )
}