import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import Layout from "@/Components/Layout"
import ListItems from "@/Components/ListItems"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { usePermissionsAndRolesContext } from "@/context/PermissionAndRolesContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPermission } from "@/types/types"
import { useAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"
import { toast } from "react-toastify"

export default function Permissoes() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: getPermissions, mutate } = useAuthorizedFetch<IPermission[]>('/permission', {
        allowedRoles: ['ADMIN']
    })
    const { deletePermission } = usePermissionsAndRolesContext()

    const permissionsSorted = getPermissions ? sortArrayByProperty(getPermissions, "name") : [];

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
        <ProtectedRoute allowedRoles={["ADMIN"]}>
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
                            {permissionsSorted && (
                                <ListItems onDelete={(item_id) => handleDelete(item_id)} items={permissionsSorted} label="Permissão" path="permissoes" />
                            )}
                        </div>
                    </section>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>

    )
}