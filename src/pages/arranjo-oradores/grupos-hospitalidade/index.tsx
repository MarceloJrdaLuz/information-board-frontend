import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import GroupIcon from "@/Components/Icons/GroupIcon"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonHospitalityGroupsList from "@/Components/SkeletonHospitalityGroupsList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteHospitalityGroupAtom, selectedHospitalityGroupAtom } from "@/atoms/hospitalityGroupsAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IHospitalityGroup } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import Router from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

function HospitalityGroupsPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const deleteHospitalityGroup = useSetAtom(deleteHospitalityGroupAtom)
    const setHospitalityGroupUpdate = useSetAtom(selectedHospitalityGroupAtom)

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [hospitalityGroups, setHospitalityGroups] = useState<IHospitalityGroup[]>()

    const { data: getHospitalityGroups, mutate } = useAuthorizedFetch<IHospitalityGroup[]>(`/congregation/${congregation_id ?? ""}/hospitalityGroups`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    useEffect(() => {
        if (getHospitalityGroups) {
            const sort = sortArrayByProperty(getHospitalityGroups, "name")
            setHospitalityGroups(sort)
        }
    }, [getHospitalityGroups])

    useEffect(() => {
        setPageActive('Grupos de hospitalidade')
    }, [setPageActive])

    function handleDelete(hospitalityGroup_id: string) {
        toast.promise(deleteHospitalityGroup(hospitalityGroup_id), {
            pending: 'Excluindo grupo...',
        }).then(() => {
            mutate()
        }).catch(err => {
            console.log(err)
        })
    }

    let skeletonHospitalityGroupsList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
                {skeletonHospitalityGroupsList.map((a, i) => (<SkeletonHospitalityGroupsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Grupos de Hospitalidade"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Grupos de hospitalidade</h1>
                    <div className="flex justify-between items-center mb-3">
                        <Button
                            outline
                            onClick={() => {
                                Router.push('/arranjo-oradores/grupos-hospitalidade/add')
                            }}
                            className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                            <GroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-primary-200 font-semibold">Criar grupo</span>
                        </Button>
                        {hospitalityGroups && <span className="text-sm text-typography-800">Total: {hospitalityGroups.length}</span>}
                    </div>

                    {hospitalityGroups && hospitalityGroups.length > 0 ? (
                        <ListGeneric
                            onDelete={(item_id) => handleDelete(item_id)}
                            onUpdate={(group) => setHospitalityGroupUpdate(group)}
                            items={hospitalityGroups}
                            path="/arranjo-oradores/grupos-hospitalidade"
                            label="do grupo"
                            renderItem={(group) => (
                                <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-typography-800">{group.name}</h3>

                                    <div className="text-sm text-typography-700 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            🏠 <span>{group.host?.fullName || "Nenhum anfitrião"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            👥 <span>Membros:</span>
                                            {group.members && group.members.length > 0
                                                ? group.members.map((m) => (
                                                    <span key={m.id} className="ml-4 text-typography-700">{m.fullName}</span>
                                                ))
                                                : <span className="ml-4 text-typography-700">Nenhum membro adicionado</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        />

                    )
                        : (
                            <>
                                {!hospitalityGroups ? renderSkeleton() : <EmptyState message="Nenhum grupo de hospitalidade cadastrado" />}
                            </>
                        )
                    }
                </div>
            </section>
        </ContentDashboard>
    )
}

HospitalityGroupsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default HospitalityGroupsPage