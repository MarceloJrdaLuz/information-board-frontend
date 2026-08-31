import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import AddPersonIcon from "@/Components/Icons/AddPersonIcon"
import PublisherList from "@/Components/PublishersList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { CalendarOff } from "lucide-react"
import Router from "next/router"
import { useEffect } from "react"

function PublishersPage() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Publicadores')
    }, [setPageActive])
    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Publicadores"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <div className="flex flex-wrap gap-3 justify-start">
                        <Button
                            outline
                            onClick={() => {
                                Router.push('/congregacao/publicadores/add')
                            }}
                            className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80"
                        >
                            <AddPersonIcon />
                            <span className="text-primary-200 font-semibold">Adicionar pessoa</span>
                        </Button>

                        <Button
                            outline
                            onClick={() => {
                                Router.push('/congregacao/publicadores/indisponibilidades')
                            }}
                            className="text-amber-600 dark:text-amber-400 p-3 border-typography-300 rounded-none hover:opacity-80 flex items-center gap-2"
                        >
                            <CalendarOff className="h-5 w-5 text-amber-500" />
                            <span className="font-semibold">Indisponibilidades</span>
                        </Button>
                    </div>
                    <PublisherList />
                </div>
            </section>
        </ContentDashboard>
    )
}

PublishersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER", "PUBLISHERS_VIEWER"])

export default PublishersPage