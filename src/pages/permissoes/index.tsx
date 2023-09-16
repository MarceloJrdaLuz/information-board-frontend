import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import Layout from "@/Components/Layout"
import ListPermissions from "@/Components/ListPermissions"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import Link from "next/link"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect } from "react"

export default function Permissoes() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Permissões')
    }, [setPageActive])

    return (
        <Layout pageActive="Permissões">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-2xl text-primary-200 font-semibold">Permissões</h1>
                        <button className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3 my-5 text-primary-200"><SecurityIcon /><span className="text-primary-200 font-semibold pl-1"
                            onClick={() => {
                                Router.push('/permissoes/add')
                            }}>Criar permissão</span></button>
                        <ListPermissions />
                    </div>
                </section>
                {/* <Link href={'/permissoes/add'}>
                    <div>Criar permissão</div>
                </Link>
                <Link href={'/permissoes/add-funcao'}>
                    <div>Criar função</div>
                </Link>
                <Link href={'/permissoes/atribuir-funcao'}>
                    <div>Atribuir funções a um usuário</div>
                </Link> */}
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