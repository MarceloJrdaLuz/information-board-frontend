import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import NoticesIcon from "@/Components/Icons/NoticesIcon"
import ListNotices from "@/Components/ListNotices"
import SkeletonListNotices from "@/Components/ListNotices/skeleton"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useNotices } from "@/hooks/useNotices"
import { INotice } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"

function NoticesPage() {
    const { congregation } = useCongregationContext()
    const { deleteNotice } = useNotices(congregation?.number ?? "")
    const congregation_id = congregation?.id

    const [crumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const fetchConfig = congregation_id ? `/notices/${congregation_id}` : ""
    const { data: notices, mutate, isLoading } = useAuthorizedFetch<INotice[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "NOTICES_MANAGER"]
    })

    useEffect(() => {
        setPageActive('Anúncios')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Anúncios"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <div className="flex flex-col">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Anúncios</h1>
                        <Button
                            outline
                            onClick={() => {
                                Router.push('/anuncios/add')
                            }}
                            className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                            <NoticesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-primary-200 font-semibold">Criar anúncio</span>
                        </Button>
                    </div>
                    {isLoading ? (
                        <SkeletonListNotices />

                    ) : notices && (
                        <ListNotices onDelete={async (notice_id) => {
                            await deleteNotice(notice_id)
                            mutate() // agora ele vai buscar os dados já atualizados
                        }} notices={notices} />

                    )}

                </div>
            </section>
        </ContentDashboard>
    )
}

NoticesPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "NOTICES_MANAGER"])

export default NoticesPage