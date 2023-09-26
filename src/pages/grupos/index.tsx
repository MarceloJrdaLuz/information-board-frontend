import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import GroupIcon from "@/Components/Icons/GroupIcon"
import GroupOverseersIcon from "@/Components/Icons/GroupOverseersIcon"
import Layout from "@/Components/Layout"
import ListGroups from "@/Components/ListGroups"
import ListItems from "@/Components/ListItems"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { AuthContext } from "@/context/AuthContext"
import { IGroup, IRole } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { FunctionSquareIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useContext, useEffect, useState } from "react"

export default function Grupos() {
    const { user } = useContext(AuthContext)
    const congregationUser = user?.congregation

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [groups, setGroups] = useState<IGroup[]>()

    const fetchConfig = congregationUser ? `/groups/${congregationUser.id}` : ""
    const { data: getGroups } = useFetch<IGroup[]>(fetchConfig)

    useEffect(() => {
        setGroups(getGroups)
    }, [getGroups, groups])

    useEffect(() => {
        setPageActive('Grupos')
    }, [setPageActive])

    return (
        <Layout pageActive="grupos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Grupos de campo</h1>
                        <Button
                            onClick={() => {
                                Router.push('/grupos/add')
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <GroupIcon />
                            <span className="text-primary-200 font-semibold pl-1">Criar grupo</span>
                        </Button>
                        {groups && <ListGroups items={groups} path="" label="grupo" />}
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
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