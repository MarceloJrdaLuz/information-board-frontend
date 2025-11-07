import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormAddRole from "@/Components/Forms/FormAddRole"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AddRolePage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Funções', link: '/administracao/funcoes' }]
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
        setPageActive('Nova função')
    }, [setPageActive])

    return (
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={"Criar Funções"} />
                <section className="flex m-10 justify-center items-center">
                    <FormAddRole />
                </section>
            </ContentDashboard>
    )
}


AddRolePage.getLayout = withProtectedLayout(["ADMIN"])

export default AddRolePage