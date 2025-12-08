import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import FormTerritoryHistory from "@/Components/Forms/FormTerritoryHistory"
import { atomTerritoryHistoryAction, crumbsAtom, pageActiveAtom, territoryHistoryToUpdate } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useTerritoryContext } from "@/context/TerritoryContext"
import { sortByCompletionDate } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import TerritoriesProviderLayout from "@/layouts/providers/territories/_layout"
import { CreateTerritoryHistoryArgs, DeleteTerritoryHistoryArgs, ITerritoryHistory, UpdateTerritoryHistoryArgs } from "@/types/territory"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { FileClockIcon, InfoIcon } from "lucide-react"
import { useRouter } from "next/router"
import { ReactElement, useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from "react-toastify"

function EditHistoryTerritoryPage() {
    const router = useRouter()
    const { territory_id } = router.query
    const methods = useForm()
    const { createTerritoryHistory, updateTerritoryHistory, deleteTerritoryHistory } = useTerritoryContext()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [territoryHistoryAction, setTerritoryHistoryAction] = useAtom(atomTerritoryHistoryAction)
    const [, setTerritorHistoryToUpdateId] = useAtom(territoryHistoryToUpdate)

    const { data: getHistory, mutate } = useAuthorizedFetch<ITerritoryHistory[]>(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"]
    })

    async function handleCreate(data: CreateTerritoryHistoryArgs) {
        await toast.promise(createTerritoryHistory(data), {
            pending: 'Criando histórico do território...'
        }).then(() => {
            mutate()
        }).catch(err => {
            console.log(err)
        })
    }

    async function handleUpdate(data: UpdateTerritoryHistoryArgs) {
        await toast.promise(updateTerritoryHistory(data), {
            pending: 'Atualizando histórico do território...'
        }).then(() => {
            mutate()
        }).catch(err => {
            console.log(err)
        })
    }

    async function handleDelete(data: DeleteTerritoryHistoryArgs) {
        await toast.promise(deleteTerritoryHistory(data), {
            pending: 'Excluindo histórico do território...'
        }).then(() => {
            mutate()
        }).catch(err => {
            console.log(err)
        })
    }


    useEffect(() => {
        setTerritoryHistoryAction("")
        setTerritorHistoryToUpdateId("")
    }, [setTerritoryHistoryAction, setTerritorHistoryToUpdateId])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Territórios', link: `/congregacao/territorios` }]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive('Histórico')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Histórico do Território"} />
            <FormProvider {...methods}>
                <section className="flex flex-wrap justify-around ">
                    <div className="w-full m-5 flex justify-start">
                        <div className="flex justify-start items-start flex-wrap">
                            {getHistory && <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-typography-700 font-semibold">{`${getHistory[0].territory.number} - ${getHistory[0].territory.name}`}</h1>}
                            <div className="w-full flex flex-start">
                                {!getHistory?.some(history => history.completion_date === null) &&
                                    <Button
                                        outline
                                        onClick={() => {
                                            setTerritoryHistoryAction("create");
                                            setTerritorHistoryToUpdateId("");
                                        }}
                                        className="bg-surface-100 text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80 mb-3">
                                        <FileClockIcon />
                                        <span className="text-primary-200 font-semibold">Adicionar Histórico</span>
                                    </Button>}
                            </div>
                            {getHistory?.some(history => history.completion_date === null) && (
                                <div className="flex text-typography-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
                                    <span className="h-full pr-1">
                                        <InfoIcon className="p-0.5 text-primary-200" />
                                    </span>
                                    <span>Existe um histórico em aberto. Conclua-o antes de reabri-lo.</span>
                                </div>
                            )}
                        </div>

                    </div>
                    {territoryHistoryAction === "create" && (
                        <FormTerritoryHistory
                            key="new"
                            territoryHistory={null}
                            onCreate={handleCreate}
                        />
                    )}
                    {getHistory && getHistory.length > 0 ? (
                        sortByCompletionDate(getHistory).map((history) => (
                            <FormTerritoryHistory
                                key={history.id}
                                territoryHistory={history}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        ))
                    ) : (
                        territoryHistoryAction !== "create" &&
                        <div className="flex text-typography-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
                            <span className="h-full pr-1">
                                <InfoIcon className="p-0.5 text-primary-200" />
                            </span>
                            <span>Nenhum registro para esse território.</span>
                        </div>
                    )}
                </section>
            </FormProvider>
        </ContentDashboard>
    )
}

EditHistoryTerritoryPage.getLayout = (page: ReactElement) =>
    withProtectedLayout(["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"])(
        <TerritoriesProviderLayout>{page}</TerritoriesProviderLayout>
    )

export default EditHistoryTerritoryPage