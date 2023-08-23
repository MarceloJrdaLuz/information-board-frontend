import ContentDashboard from "@/Components/ContentDashboard"
import FormUpdateCongregation from "@/Components/FormUpdateCongregation"
import Layout from "@/Components/Layout"
import { AuthContext } from "@/context/AuthContext"
import { getAPIClient } from "@/services/axios"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useContext } from "react"

export default function InformacoesCongregacoes() {
    const { user: getUser, roleContains } = useContext(AuthContext)

    const isAdmincongregation = roleContains('ADMIN_CONGREGATION')

    return (
        <Layout pageActive="informacoes-congregacoes">
            <ContentDashboard>
                <div className="flex justify-center items-center py-5">
                    {isAdmincongregation && <FormUpdateCongregation/>}
                </div>
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