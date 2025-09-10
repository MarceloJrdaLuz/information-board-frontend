import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import FilterSpeakersCongregation from "@/Components/FilterGeneric"
import GroupIcon from "@/Components/Icons/GroupIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteSpeakerAtom, selectedSpeakerAtom } from "@/atoms/speakerAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { ICongregation, ISpeaker } from "@/entities/types"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom, useSetAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function SpeakersPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const deleteSpeaker = useSetAtom(deleteSpeakerAtom)
    const setSpeakerUpdate = useSetAtom(selectedSpeakerAtom)

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [speakers, setSpeakers] = useState<ISpeaker[]>()
    const [filteredByCongregationId, setFilteredByCongregationId] = useState("")

    const { data: getSpeakers, mutate } = useFetch<ISpeaker[]>("/speakers")

    const { data: getAuxiliaryCongregations } = useFetch<ICongregation[]>("/auxiliaryCongregations")

    // junta a congregação principal + auxiliares
    const congregationsForFilter: ICongregation[] = congregation
        ? [congregation, ...(getAuxiliaryCongregations ?? [])]
        : (getAuxiliaryCongregations ?? [])

    useEffect(() => {
        if (getSpeakers) {
            const sort = sortArrayByProperty(getSpeakers, "fullName")
            setSpeakers(sort)
        }
    }, [getSpeakers])

    useEffect(() => {
        if (!getSpeakers) return

        if (filteredByCongregationId) {
            const filteredSpeakersByCongregation = getSpeakers.filter(
                s => s.originCongregation.id === filteredByCongregationId
            )
            setSpeakers(filteredSpeakersByCongregation)
        } else {
            // sem filtro → mostra todos
            const sort = sortArrayByProperty(getSpeakers, "fullname")
            setSpeakers(sort)
        }
    }, [filteredByCongregationId, getSpeakers])


    useEffect(() => {
        setPageActive('Oradores')
    }, [setPageActive])

    function handleDelete(speaker_id: string) {
        toast.promise(deleteSpeaker(speaker_id), {
            pending: 'Excluindo orador...',
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
        <Layout pageActive="oradores">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Oradores</h1>
                        <div className="flex flex-1 justify-start">
                            <Button
                                onClick={() => {
                                    Router.push('/arranjo-oradores/oradores/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <GroupIcon />
                                <span className="text-primary-200 font-semibold">Criar orador</span>
                            </Button>
                        </div>

                        <FilterSpeakersCongregation
                            checkedOptions={filteredByCongregationId}
                            handleCheckboxChange={(item) => setFilteredByCongregationId(item)}
                            congregations={congregationsForFilter ?? []} />

                        {speakers && speakers.length > 0 ? (
                            <ListGeneric
                                onDelete={(item_id) => handleDelete(item_id)}
                                onUpdate={(speaker) => setSpeakerUpdate(speaker)}
                                items={speakers}
                                path="/arranjo-oradores/oradores"
                                label="do Orador"
                                renderItem={(speaker) => (
                                    <div className="flex flex-col">
                                        <div className="flex justify-between flex-wrap">
                                            <div className="text-sm flex flex-col  w-fit justify-start p-4 text-primary-200 font-semibold">
                                                Nome do orador:
                                                <span className="text-sm font-semi-bold text-typography-100">{speaker.fullName}</span>
                                            </div>
                                            <div className="text-sm flex flex-col w-fit justify-start  p-4 text-primary-200 font-semibold">
                                                Telefone:
                                                <span className="text-sm font-semi-bold text-typography-100">{speaker.phone ? `${speaker.phone}` : "Não Cadastrado"}</span>
                                            </div>
                                            <div className="text-sm flex flex-col w-fit flex-wrap justify-start  p-4 text-primary-200 font-semibold">
                                                Congregação:
                                                <span className="text-sm font-semi-bold text-typography-100">{speaker.originCongregation.name}</span>
                                            </div>
                                            <div className="text-sm flex flex-col w-fit flex-wrap justify-start p-4 text-primary-200 font-semibold">
                                                Endereço:
                                                <span className="text-sm font-semi-bold text-typography-100">{speaker.address ? `${speaker.address}` : "Não Cadastrado"}</span>
                                            </div>
                                        </div>
                                        <div className="">
                                            <div className="text-sm flex w-fit flex-wrap justify-start p-4 text-primary-200 font-semibold">
                                                Discursos preparados:
                                                <span className="text-sm font-semi-bold text-typography-100 ml-2">
                                                    {speaker.talks?.map(talk => talk.number).join(", ")}
                                                </span>

                                            </div>
                                        </div>
                                    </div>

                                )}
                            />
                        )
                            : (
                                <>
                                    {!speakers ? renderSkeleton() : <EmptyState message="Nenhum orador cadastrado" />}
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