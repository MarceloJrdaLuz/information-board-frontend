import ContentDashboard from "@/Components/ContentDashboard"
import FormAddPublisher from "@/Components/FormAddPublisher"
import Layout from "@/Components/Layout"
import { getAPIClient } from "@/services/axios"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"

export default function AddPublicadores() {

    return (
        <Layout pageActive="publicadores">
            <ContentDashboard>
                <section className="flex justify-center">
                    <FormAddPublisher/>
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

    return {
        props: {}
    }
}