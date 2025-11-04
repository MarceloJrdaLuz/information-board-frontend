import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import FormTerritoryHistory from "@/Components/Forms/FormTerritoryHistory"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { atomTerritoryHistoryAction, crumbsAtom, pageActiveAtom, territoryHistoryToUpdate } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { sortByCompletionDate } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITerritoryHistory } from "@/types/territory"
import { useAtom } from "jotai"
import { FileClockIcon, InfoIcon } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'

export default function EditHistoryTerritory() {
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
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "TERRITORIES_MANAGER"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <FormProvider {...methods}>
                        <section className="flex flex-wrap justify-around ">
                            <div className="w-full m-5 flex justify-start">

                                <div className="flex justify-start items-start flex-wrap">
                                    <div className="w-full flex flex-start">
                                        <Button
                                            onClick={() => {
                                                setTerritoryHistoryAction("create");
                                                setTerritorHistoryToUpdateId("");
                                            }}
                                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80 mb-3">
                                            <FileClockIcon />
                                            <span className="text-primary-200 font-semibold">Adicionar Histórico</span>
                                        </Button>
                                    </div>
                                    {getHistory?.some(history => history.completion_date === null) && (
                                        <div className="flex text-gray-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
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
                                <div className="flex text-gray-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
                                    <span className="h-full pr-1">
                                        <InfoIcon className="p-0.5 text-primary-200" />
                                    </span>
                                    <span>Nenhum registro para esse território.</span>
                                </div>
                            )}
                        </section>
                    </FormProvider>
                </ContentDashboard>
        </ProtectedRoute>
    )
}