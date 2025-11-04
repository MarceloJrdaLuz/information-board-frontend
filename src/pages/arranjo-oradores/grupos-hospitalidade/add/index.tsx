import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddHospitalityGroup from "@/Components/Forms/FormAddHospitalityGroup"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import { useEffect } from "react"

export default function AddHospitalityGroupPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Grupos de hospitalidade', link: '/arranjo-oradores/grupos-hospitalidade' }]
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
        setPageActive('Criar grupo')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "TALK_MANAGER"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex m-10 justify-center items-center">
                        <FormAddHospitalityGroup />
                    </section>
                </ContentDashboard>
        </ProtectedRoute>
    )
}