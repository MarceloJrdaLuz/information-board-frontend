import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import GroupIcon from "@/Components/Icons/GroupIcon"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteTalkAtom, selectedTalkAtom } from "@/atoms/talksAtoms"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITalk } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"
import { toast } from "react-toastify"

function TalksPage() {
    const { roleContains } = useAuthContext()
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const deleteTalk = useSetAtom(deleteTalkAtom)
    const setTalkUpdate = useSetAtom(selectedTalkAtom)

    const { data: talks, mutate } = useAuthorizedFetch<ITalk[]>("/talks", {
        allowedRoles: ["ADMIN", "ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    useEffect(() => {
        setPageActive('Discursos')
    }, [setPageActive])

    function handleDelete(talk_id: string) {
        toast.promise(deleteTalk(talk_id), {
            pending: 'Excluindo discurso...',
        })
        mutate()
    }

    let skeletonSpeakersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
                {skeletonSpeakersList.map((a, i) => (<SkeletonGroupsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Discursos"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Discursos</h1>
                    <div className="flex justify-between items-center mb-3">
                        {roleContains('ADMIN') && (
                            <Button outline
                                onClick={() => Router.push('/arranjo-oradores/discursos/add')}
                                className="bg-surface-100 text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80"
                            >
                                <GroupIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                                <span className="text-primary-200 font-semibold">Criar discurso</span>
                            </Button>
                        )}
                        {talks && <span className="text-sm text-typography-800">Total: {talks.length}</span>}
                    </div>

                    {talks && talks.length > 0 ? (
                        <ListGeneric
                            showActions={!roleContains('ADMIN') ? false : true}
                            onDelete={(item_id) => handleDelete(item_id)}
                            onUpdate={(talk) => setTalkUpdate(talk)}
                            items={talks}
                            path="/arranjo-oradores/discursos"
                            label="do Discurso"
                            renderItem={(talk) => (
                                <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-typography-800">Discurso Nº {talk.number}</h3>

                                    <div className="text-sm text-typography-700 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            🎯 <span>{talk.title || "Sem título"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    )
                        : (
                            <>
                                {!talks ? renderSkeleton() : <EmptyState message="Nenhum discurso cadastrado" />}
                            </>
                        )
                    }
                </div>
            </section>
        </ContentDashboard>
    )
}

TalksPage.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION", "TALK_MANAGER"])

export default TalksPage