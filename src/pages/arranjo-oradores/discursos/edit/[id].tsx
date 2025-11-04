import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditTalk from "@/Components/Forms/FormEditTalk"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import { useEffect } from "react"

export default function EditTalkPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Discursos', link: '/arranjo-oradores/discursos' }]
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
        setPageActive('Editar discurso')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex justify-center">
                        <FormEditTalk />
                    </section>
                </ContentDashboard>
        </ProtectedRoute>
    )
}