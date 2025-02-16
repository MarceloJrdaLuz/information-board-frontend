import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import FormTerritoryHistory from "@/Components/Forms/FormTerritoryHistory"
import Layout from "@/Components/Layout"
import { atomTerritoryHistoryAction, crumbsAtom, pageActiveAtom, territoryHistoryToUpdate } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { ITerritoryHistory } from "@/entities/territory"
import { sortByCompletionDate } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { FileClockIcon, InfoIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useEffect } from "react"
import { FormProvider, useForm } from 'react-hook-form'

export default function EditHistoryTerritory() {
    const router = useRouter()
    const { territory_id } = router.query
    const methods = useForm()
    const { data: getHistory } = useFetch<ITerritoryHistory[]>(`${API_ROUTES.TERRITORYHISTORY}/${territory_id}`)

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [territoryHistoryAction, setTerritoryHistoryAction] = useAtom(atomTerritoryHistoryAction)
    const [territorHistoryToUpdateId, setTerritorHistoryToUpdateId] = useAtom(territoryHistoryToUpdate)

    useEffect(() => {
        setTerritoryHistoryAction("")
        setTerritorHistoryToUpdateId("")
    }, [setTerritoryHistoryAction, setTerritorHistoryToUpdateId])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Territórios', link: `/territorios` }]
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
        <Layout pageActive="territorios">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <FormProvider {...methods}>
                    <section className="flex flex-wrap justify-around ">
                        <div className="w-full m-5 flex justify-start">
                            <Button
                                onClick={() => {
                                    setTerritoryHistoryAction("create");
                                    setTerritorHistoryToUpdateId("");
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <FileClockIcon />
                                <span className="text-primary-200 font-semibold">Adicionar Histórico</span>
                            </Button>
                            {!getHistory?.some(history => history.completion_date === null) && (
                                <div className="flex text-gray-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
                                    <span className="h-full pr-1">
                                        <InfoIcon className="p-0.5 text-primary-200" />
                                    </span>
                                    <span>Existe um histórico em aberto. Conclua-o antes de reabri-lo.</span>
                                </div>

                            )}
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('TERRITORIES_MANAGER')) {
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