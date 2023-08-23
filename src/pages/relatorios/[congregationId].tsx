import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListRelatorios from "@/Components/ListRelatorios"
import { getAPIClient } from "@/services/axios"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"

export default function ListarRelatórios() {

    const router = useRouter()
    const { congregationId } = router.query


    return (
        <Layout pageActive="relatorios">
            <ContentDashboard>
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