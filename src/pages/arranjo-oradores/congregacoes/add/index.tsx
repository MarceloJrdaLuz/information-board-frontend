import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddCongregationAuxiliary from "@/Components/Forms/FormAddCongregationAuxiliary"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import 'moment/locale/pt-br'
import { useEffect } from "react"

function AddAuxiliaryCongregationPage() {
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
        setPageActive('Criar congregação')
    }, [setPageActive])


    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar Congregação"} />
            <section className="flex m-10 justify-center items-center">
                <FormAddCongregationAuxiliary />
            </section>
        </ContentDashboard>
    )
}

AddAuxiliaryCongregationPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default AddAuxiliaryCongregationPage