import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import PublisherList from "@/Components/PublishersList"
import { iconeAddPessoa } from "@/assets/icons"
import { getAPIClient } from "@/services/axios"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"

export default function Publicadores() {

    return (
        <Layout pageActive="publicadores">
            <ContentDashboard>
                <section className="flex flex-wrap w-full h-full p-5">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-2xl text-primary-200 font-semibold">Registros de pessoas</h1>
                        <button className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3 my-5">{iconeAddPessoa("#178582")} <span className="text-primary-200 font-semibold pl-1"
                            onClick={() => Router.push('/publicadores/add')}>Adicionar pessoa</span></button>
                        <PublisherList />
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

    return {
        props: {}
    }
}