import ContentDashboard from "@/Components/ContentDashboard"
import FormEditPublisher from "@/Components/FormEditPublisher"
import Layout from "@/Components/Layout"
import { getAPIClient } from "@/services/axios"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { FormProvider, useForm } from 'react-hook-form'

export default function EditPublishers() {

    const router = useRouter()
    const { id } = router.query

    const methods = useForm()

    return (
        <Layout pageActive="publicadores">
            <ContentDashboard>
            <FormProvider {...methods}>
                <section className="flex justify-center">
                    <FormEditPublisher id={`${id}`}/>
                </section>
            </FormProvider>
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