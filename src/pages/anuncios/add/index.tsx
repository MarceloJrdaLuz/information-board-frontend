import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddNotice from "@/Components/Forms/FormAddNotice"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddNoticePage() {
    const { congregation } = useCongregationContext()
    const congregationNumber = congregation?.number as string

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
        setPageActive('Adicionar anúncio')
    }, [setPageActive])

    return (
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={"Criar Anúncio"} />
                <section className="flex justify-center">
                    <FormAddNotice congregationNumber={congregationNumber} />
                </section>
            </ContentDashboard>
    )
}

AddNoticePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "NOTICES_MANAGER"])

export default AddNoticePage