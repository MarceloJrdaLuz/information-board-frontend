import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import GroupIcon from "@/Components/Icons/GroupIcon"
import ListGroups from "@/Components/ListGroups"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IGroup } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import Router from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function GroupsPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const { handleSubmitError, handleSubmitSuccess } = useSubmit()
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [groups, setGroups] = useState<IGroup[]>()

    const fetchConfig = congregation_id ? `/groups/${congregation_id}` : ""
    const { data: getGroups, mutate } = useAuthorizedFetch<IGroup[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER", "GROUPS_VIEWER"]
    })

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

    let skeletonGropsList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
                {skeletonGropsList.map((a, i) => (<SkeletonGroupsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Grupos de Campo"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <div className="flex flex-col">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Grupos de campo</h1>
                        <Button
                            outline
                            onClick={() => {
                                Router.push('/congregacao/grupos/add')
                            }}
                            className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                            <GroupIcon />
                            <span className="text-primary-200 font-semibold">Criar grupo</span>
                        </Button>
                    </div>
                    {groups && groups.length > 0 ? (
                        <ListGroups onDelete={(item_id) => handleDelete(item_id)} items={groups} path="" label="grupo" />
                    )
                        : (
                            <>
                                {!groups ? renderSkeleton() : <EmptyState message="Nenhum grupo cadastrado nessa congregação!" />}
                            </>
                        )
                    }
                </div>
            </section>
        </ContentDashboard>
    )
}

GroupsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "GROUPS_MANAGER", "GROUPS_VIEWER"])

export default GroupsPage