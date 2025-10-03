import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import SalonIcon from "@/Components/Icons/SalonIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteAuxiliaryCongregationAtom, selectedAuxiliaryCongregationAtom } from "@/atoms/auxiliaryCongregationAtoms"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { ICongregation } from "@/types/types"
import { useAtom, useSetAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function AuxiliaryCongregationsPage() {
    const setAuxiliaryCongregationUpdate = useSetAtom(selectedAuxiliaryCongregationAtom)
    const deleteAuxiliaryCongregation = useSetAtom(deleteAuxiliaryCongregationAtom)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [congregations, setCongregations] = useState<ICongregation[]>()

    const { data: getAuxiliaryCongregations, mutate } = useFetch<ICongregation[]>("/auxiliaryCongregations")

    useEffect(() => {
        if (getAuxiliaryCongregations) {
            setCongregations(getAuxiliaryCongregations)
        }
    }, [getAuxiliaryCongregations])

    useEffect(() => {
        setPageActive('Congregações')
    }, [setPageActive])

    function handleDelete(congregation_id: string) {
        toast.promise(deleteAuxiliaryCongregation(congregation_id), {
            pending: 'Excluindo congreegação...',
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
        <Layout pageActive="congregacoes">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full  p-5 ">
                    <div className="flex flex-col w-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">
                            Congregações
                        </h1>
                        <Button
                            onClick={() => {
                                Router.push('/arranjo-oradores/congregacoes/add')
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <SalonIcon />
                            <span className="text-primary-200 font-semibold">Criar congregação</span>
                        </Button>
                    </div>
                    <div className="flex justify-center items-center w-full mt-5">
                        {congregations && congregations.length > 0 ? (
                            <ListGeneric
                                onDelete={(item_id) => handleDelete(item_id)}
                                onUpdate={(congregation) => setAuxiliaryCongregationUpdate(congregation)}
                                items={congregations}
                                path="/arranjo-oradores/congregacoes"
                                label="da Congregação"
                                renderItem={(congregation) => (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{congregation.name}</h3>

                                        <div className="text-sm text-gray-600 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                🏙️ <span>{congregation.city || "Não cadastrada"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                🔄 <span>{congregation.circuit || "Não cadastrado"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                📅 <span>{congregation.dayMeetingPublic || "Não cadastrado"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                ⏰ <span>{congregation.hourMeetingPublic ? congregation.hourMeetingPublic.slice(0, 5) : "Não cadastrado"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />

                        )
                            : (
                                <>
                                    {!congregations ? renderSkeleton() : <EmptyState message="Nenhuma congregação cadastrada" />}
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