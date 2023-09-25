import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListItems from "@/Components/ListItems"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { IRole } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { FunctionSquareIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"

export default function Funcoes() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const { data: getRoles } = useFetch<IRole[]>('/roles')
    const [roles, setRoles] = useState<IRole[]>()

    useEffect(() => {
        setRoles(getRoles)
    }, [getRoles, roles])

    useEffect(() => {
        setPageActive('Funções')
    }, [setPageActive])

    return (
        <Layout pageActive="funcoes">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Funções</h1>
                        <button className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3 my-5 text-primary-200"><FunctionSquareIcon /><span className="text-primary-200 font-semibold pl-1"
                            onClick={() => {
                                Router.push('/funcoes/add')
                            }}>Criar função</span></button>
                        {roles &&  (
                            <ListItems items={roles} label="Funções" path="funcoes" />
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
    const { ['user-roles']: userRoles } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const userRolesParse: string[] = JSON.parse(userRoles)

    if(!userRolesParse.includes('ADMIN')){
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