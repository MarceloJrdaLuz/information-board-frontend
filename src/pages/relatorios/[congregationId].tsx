import BreadCrumbs from "@/Components/BreadCrumbs"
import { IBreadCrumbs } from "@/Components/BreadCrumbs/types"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListRelatorios from "@/Components/ListMonths"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies, setCookie } from "nookies"
import { useEffect } from "react"

export default function ListarRelatorios() {

    const router = useRouter()
    const { congregationId } = router.query

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Relatórios')       
    }, [setPageActive])

    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <ListRelatorios congregationId={congregationId as string} />
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

    return {
        props: {}
    }
}