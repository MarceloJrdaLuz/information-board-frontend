import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import GroupIcon from "@/Components/Icons/GroupIcon"
import Layout from "@/Components/Layout"
import ListGroups from "@/Components/ListGroups"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { useSubmitContext } from "@/context/SubmitFormContext"
import { IGroup, IRole } from "@/entities/types"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function Grupos() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [groups, setGroups] = useState<IGroup[]>()

    const fetchConfig = congregation_id ? `/groups/${congregation_id}` : ""
    const { data: getGroups, mutate } = useFetch<IGroup[]>(fetchConfig)

    useEffect(() => {
        if (getGroups) {
            const sort = sortArrayByProperty(getGroups, "number")
            setGroups(sort)
        }
    }, [getGroups])

    useEffect(() => {
        setPageActive('Grupos')
    }, [setPageActive])

    async function deleteGroup(group_id: string) {
        await api.delete(`group/${group_id}`).then(res => {
            mutate()
            handleSubmitSuccess(messageSuccessSubmit.groupDelete)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(message)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    function handleDelete(group_id: string) {
        toast.promise(deleteGroup(group_id), {
            pending: 'Excluindo grupo...',
        })
    }

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
                            <span className="text-primary-200 font-semibold">Criar grupo</span>
                        </Button>
                        {groups && <ListGroups onDelete={(item_id) => handleDelete(item_id)} items={groups} path="" label="grupo" />}
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

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('GROUPS_MANAGER') && !userRolesParse.includes('GROUPS_VIEWER')) {
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