import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import ListItems from "@/Components/ListItems"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { usePermissionsAndRoles } from "@/hooks/usePermissionsAndRoles"
import { IPermission } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"
import { toast } from "react-toastify"

function PermissionsPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: getPermissions, mutate } = useAuthorizedFetch<IPermission[]>('/permission', {
        allowedRoles: ['ADMIN']
    })
    const { deletePermission } = usePermissionsAndRoles()

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
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Permissões"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <div className="flex flex-col">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Permissões</h1>
                        <Button outline
                            onClick={() => {
                                Router.push('/permissoes/add')
                            }}
                            className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                            <SecurityIcon />
                            <span className="text-primary-200 font-semibold">Criar permissão</span>
                        </Button>
                    </div>
                    {permissionsSorted && (
                        <ListItems onDelete={(item_id) => handleDelete(item_id)} items={permissionsSorted} label="Permissão" path="permissoes" />
                    )}
                </div>
            </section>
        </ContentDashboard>
    )
}

PermissionsPage.getLayout = withProtectedLayout(["ADMIN"])

export default PermissionsPage