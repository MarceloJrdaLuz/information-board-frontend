import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import Layout from "@/Components/Layout"
import ListItems from "@/Components/ListItems"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { usePermissionsAndRolesContext } from "@/context/PermissionAndRolesContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { IPermission } from "@/types/types"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function Permissoes() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: getPermissions, mutate } = useFetch<IPermission[]>('/permission')
    const [permissions, setPermissions] = useState<IPermission[]>()
    const { deletePermission } = usePermissionsAndRolesContext()

    useEffect(() => {
        if(getPermissions){
            const sort = sortArrayByProperty(getPermissions, "name")
            setPermissions(sort)
        }
    }, [getPermissions])

    useEffect(() => {
        setPageActive('Permissões')
    }, [setPageActive])

    function handleDelete(item_id: string) {
         toast.promise(deletePermission(item_id), {
            pending: "Excluindo permissão..."
        })
        mutate()
    }

    return (
        <Layout pageActive="permissoes">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Permissões</h1>
                        <Button
                            onClick={() => {
                                Router.push('/permissoes/add')
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <SecurityIcon />
                            <span className="text-primary-200 font-semibold">Criar permissão</span>
                        </Button>
                        {permissions && (
                            <ListItems onDelete={(item_id) => handleDelete(item_id)} items={permissions} label="Permissão" path="permissoes" />
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

    if (!userRolesParse.includes('ADMIN')) {
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