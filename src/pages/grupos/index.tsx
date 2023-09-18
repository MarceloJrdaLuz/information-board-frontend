import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import GroupIcon from "@/Components/Icons/GroupIcon"
import GroupOverseersIcon from "@/Components/Icons/GroupOverseersIcon"
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

export default function Grupos() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const { data: getRoles } = useFetch<IRole[]>('/roles')
    const [roles, setRoles] = useState<IRole[]>()

    useEffect(() => {
        setRoles(getRoles)
    }, [getRoles, roles])

    useEffect(() => {
        setPageActive('Grupos')
    }, [setPageActive])

    return (
        <Layout pageActive="grupos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-2xl text-primary-200 font-semibold">Grupos de campo</h1>
                        <button className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3 my-5 text-primary-200"><GroupIcon /><span className="text-primary-200 font-semibold pl-1"
                            onClick={() => {
                                Router.push('/grupos/add')
                            }}>Criar grupo</span></button>
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

    if(!userRolesParse.includes('ADMIN_CONGREGATION')){
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