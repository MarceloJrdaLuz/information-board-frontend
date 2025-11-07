import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditNotice from "@/Components/Forms/FormEditNotice"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'

function EditNoticePage() {

    const router = useRouter()
    const { id } = router.query

    const methods = useForm()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Anúncios', link: '/anuncios' }]
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
        setPageActive('Editar anúncio')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Editar Anúncio"} />
            <FormProvider {...methods}>
                <section className="flex justify-center">
                    <FormEditNotice notice_id={id as string} />
                </section>
            </FormProvider>
        </ContentDashboard>
    )
}

EditNoticePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "NOTICES_MANAGER"])

export default EditNoticePage