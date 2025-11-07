import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import SalonIcon from "@/Components/Icons/SalonIcon"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteAuxiliaryCongregationAtom, selectedAuxiliaryCongregationAtom } from "@/atoms/auxiliaryCongregationAtoms"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ICongregation } from "@/types/types"
import { useAtom, useSetAtom } from "jotai"
import Router from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function AuxiliaryCongregationsPage() {
    const setAuxiliaryCongregationUpdate = useSetAtom(selectedAuxiliaryCongregationAtom)
    const deleteAuxiliaryCongregation = useSetAtom(deleteAuxiliaryCongregationAtom)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [congregations, setCongregations] = useState<ICongregation[]>()

    const { data: getAuxiliaryCongregations, mutate } = useAuthorizedFetch<ICongregation[]>("/auxiliaryCongregations", {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

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
            pending: 'Excluindo congregação...',
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
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "TALK_MANAGER"]}>
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={"Congregações"} />
                <section className="flex flex-wrap w-full  p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Congregações</h1>
                        <div className="flex justify-between items-center mb-3">
                            <Button outline
                                onClick={() => {
                                    Router.push('/arranjo-oradores/congregacoes/add')
                                }}
                                className="bg-surface-100 text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                                <SalonIcon />
                                <span className="text-primary-200 font-semibold">Criar congregação</span>
                            </Button>
                            {congregations && <span className="text-sm text-typography-600">Total: {congregations.length}</span>}
                        </div>
                        <div className="flex justify-center items-center w-full mt-5">
                            {congregations && congregations.length > 0 ? (
                                <ListGeneric
                                    onDelete={(item_id) => handleDelete(item_id)}
                                    onUpdate={(congregation) => setAuxiliaryCongregationUpdate(congregation)}
                                    items={sortArrayByProperty(congregations, "name")}
                                    path="/arranjo-oradores/congregacoes"
                                    label="da Congregação"
                                    renderItem={(congregation) => (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-lg font-semibold text-typography-800">{congregation.name}</h3>
                                            <div className="text-sm text-typography-700 flex flex-col gap-2">
                                                <div title="Cidade" className="flex items-center gap-2">
                                                    🏙️ <span>{congregation.city || "Não cadastrada"}</span>
                                                </div>
                                                <div title="Circuito" className="flex items-center gap-2">
                                                    🔄 <span>{congregation.circuit || "Não cadastrado"}</span>
                                                </div>
                                                <div title="Dia da reunião" className="flex items-center gap-2">
                                                    📅 <span>{congregation.dayMeetingPublic || "Não cadastrado"}</span>
                                                </div>
                                                <div title="Horário da reunião" className="flex items-center gap-2">
                                                    ⏰ <span>{congregation.hourMeetingPublic ? congregation.hourMeetingPublic.slice(0, 5) : "Não cadastrado"}</span>
                                                </div>
                                                <div title="Oradores" className="flex items-center gap-2">
                                                    🎤 <span>{congregation.speakers?.length}</span>
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
                    </div>
                </section>
            </ContentDashboard>
        </ProtectedRoute>
    )
}