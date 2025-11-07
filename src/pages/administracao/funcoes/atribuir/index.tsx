import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormUserRoles from "@/Components/Forms/FormUserRoles"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function AssignRole() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Funções')
    }, [setPageActive])

    return (
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={"Atribuir Funções"} />
                <section className="flex m-10 justify-center items-center">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Atribuir Funções</h1>
                        <FormUserRoles />
                    </div>
                </section>
            </ContentDashboard>
    )
}

AssignRole.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION"])

export default AssignRole