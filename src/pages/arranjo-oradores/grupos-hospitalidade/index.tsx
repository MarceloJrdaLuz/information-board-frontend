import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import GroupIcon from "@/Components/Icons/GroupIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteHospitalityGroupAtom, selectedHospitalityGroupAtom } from "@/atoms/hospitalityGroupsAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { IHospitalityGroup } from "@/entities/types"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom, useSetAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function HospitalityGroupsPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const deleteHospitalityGroup = useSetAtom(deleteHospitalityGroupAtom)
    const setHospitalityGroupUpdate = useSetAtom(selectedHospitalityGroupAtom)

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [hospitalityGroups, setHospitalityGroups] = useState<IHospitalityGroup[]>()

    const { data: getHospitalityGroups, mutate } = useFetch<IHospitalityGroup[]>(`/congregation/${congregation_id ?? ""}/hospitalityGroups`)

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
        })
        mutate()
    }

    let skeletonSpeakersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonSpeakersList.map((a, i) => (<SkeletonGroupsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <Layout pageActive="grupos-hospitalidade">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Grupos de hospitalidade</h1>
                        <div className="flex flex-1 justify-start">
                            <Button
                                onClick={() => {
                                    Router.push('/arranjo-oradores/grupos-hospitalidade/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <GroupIcon />
                                <span className="text-primary-200 font-semibold">Criar grupo</span>
                            </Button>
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
                                        <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>

                                        <div className="text-sm text-gray-600 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                🏠 <span>{group.host?.fullName || "Nenhum anfitrião"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                👥 <span>Membros:</span>
                                                {group.members && group.members.length > 0
                                                    ? group.members.map((m) => (
                                                        <span key={m.id} className="ml-4 text-gray-700">{m.fullName}</span>
                                                    ))
                                                    : <span className="ml-4 text-gray-700">Nenhum membro adicionado</span>
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('TALK_MANAGER')) {
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