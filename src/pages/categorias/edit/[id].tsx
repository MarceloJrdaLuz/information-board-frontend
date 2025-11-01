import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditCategory from "@/Components/Forms/FormEditCategory"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'

export default function EditCategory() {
    const router = useRouter()
    const { id } = router.query
    const methods = useForm()
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Categorias', link: '/categorias' }]
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
        setPageActive('Editar categoria')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout pageActive="permissoes">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <FormProvider {...methods}>
                        <section className="flex justify-center">
                            <FormEditCategory category_id={`${id}`} />
                        </section>
                    </FormProvider>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>

    )
}