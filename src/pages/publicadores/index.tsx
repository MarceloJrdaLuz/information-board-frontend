import BreadCrumbs from "@/Components/BreadCrumbs"
import { IBreadCrumbs } from "@/Components/BreadCrumbs/types"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import AddPersonIcon from "@/Components/Icons/AddPersonIcon"
import Layout from "@/Components/Layout"
import PublisherList from "@/Components/PublishersList"
import { iconeAddPessoa } from "@/assets/icons"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { getAPIClient } from "@/services/axios"
import { useAtom, useAtomValue } from "jotai"
import { GetServerSideProps } from "next"
import Link from "next/link"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect } from "react"

export default function Publicadores() {

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Publicadores')
    }, [setPageActive])
    return (
        <Layout pageActive="publicadores">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Registros de pessoas</h1>
                        <Button
                            onClick={() => {
                                Router.push('/publicadores/add')
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <AddPersonIcon />
                            <span className="text-primary-200 font-semibold pl-1">Adicionar pessoa</span>
                        </Button>
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