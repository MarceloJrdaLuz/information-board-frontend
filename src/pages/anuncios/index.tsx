import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import NoticesIcon from "@/Components/Icons/NoticesIcon"
import Layout from "@/Components/Layout"
import ListItems from "@/Components/ListItems"
import ListNotices from "@/Components/ListNotices"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { useNoticesContext } from "@/context/NoticeContext"
import { INotice } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"

export default function Notices() {
    const { congregation } = useCongregationContext()
    const { deleteNotice } = useNoticesContext()

    const congregation_id = congregation?.id

    const [crumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const fetchConfig = congregation_id ? `/notices/${congregation_id}` : ""
    const { data: getNotices, mutate } = useFetch<INotice[]>(fetchConfig)

    const [notices, setNotices] = useState<INotice[]>()

    useEffect(() => {
        if (getNotices)
            setNotices(getNotices)
    }, [getNotices, notices])

    useEffect(() => {
        setPageActive('Anúncios')
    }, [setPageActive])

    return (
        <Layout pageActive="anuncios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Anúncios</h1>
                        <Button
                            onClick={() => {
                                Router.push('/anuncios/add')
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <NoticesIcon />
                            <span className="text-primary-200 font-semibold">Criar anúncio</span>
                        </Button>
                        {notices && (
                            <ListNotices onDelete={(notice_id) => {
                                mutate()
                                deleteNotice(notice_id)
                            }} notices={notices} />
                        )}
                    </div>
                </section>
            </ContentDashboard>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}