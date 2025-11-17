import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import FormTerritoryHistory from "@/Components/Forms/FormTerritoryHistory"
import { atomTerritoryHistoryAction, crumbsAtom, pageActiveAtom, territoryHistoryToUpdate } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { sortByCompletionDate } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITerritoryHistory } from "@/types/territory"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { FileClockIcon, InfoIcon } from "lucide-react"
import { useRouter } from "next/router"
import { ReactElement, useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'
import TerritoriesProviderLayout from "../_layout"

function EditHistoryTerritoryPage() {
    const router = useRouter()
    const { territory_id } = router.query
    const methods = useForm()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [territoryHistoryAction, setTerritoryHistoryAction] = useAtom(atomTerritoryHistoryAction)
    const [, setTerritorHistoryToUpdateId] = useAtom(territoryHistoryToUpdate)

    const { data: getHistory } = useAuthorizedFetch<ITerritoryHistory[]>(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`, {
        allowedRoles: ["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"]
    })

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
                        <FormTerritoryHistory key="new" territoryHistory={null} />
                    )}
                    {getHistory && getHistory.length > 0 ? (
                        sortByCompletionDate(getHistory).map((history) => (
                            <FormTerritoryHistory key={history.id} territoryHistory={history} />
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