import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmergencyContactIcon from "@/Components/Icons/PhoneContactIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useCongregationContext } from "@/context/CongregationContext"
import { useSubmitContext } from "@/context/SubmitFormContext"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { IEmergencyContact } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function EmergencyContacts() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [emergencyContacts, setEmergencyContacts] = useState<IEmergencyContact[]>()

    const fetchConfig = congregation_id ? `/emergencyContacts/${congregation_id}` : ""
    const { data: getContactsEmergency, mutate } = useFetch<IEmergencyContact[]>(fetchConfig)

    useEffect(() => {
        if (getContactsEmergency) {
            setEmergencyContacts(getContactsEmergency)
        }
    }, [getContactsEmergency])

    useEffect(() => {
        setPageActive('Contatos de emergência')
    }, [setPageActive])

    async function deleteGroup(emergencyContact_id: string) {
        await api.delete(`emergencyContact/${emergencyContact_id}`).then(res => {
            mutate()
            handleSubmitSuccess(messageSuccessSubmit.emergencyContactDelete)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(message)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    function handleDelete(emergencyContact_id: string) {
        toast.promise(deleteGroup(emergencyContact_id), {
            pending: 'Excluindo contato...',
        })
    }

    return (
        <Layout pageActive="contatos-emergencia">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Contatos de emergência</h1>
                        <div className="flex">
                            <Button
                                onClick={() => {
                                    Router.push('/congregacao/contatos-emergencia/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <EmergencyContactIcon />
                                <span className="text-primary-200 font-semibold">Criar contato</span>
                            </Button>
                        </div>
                        {emergencyContacts &&
                            <ListGeneric
                                onDelete={(item_id) => handleDelete(item_id)}
                                items={emergencyContacts}
                                path="/congregacao/contatos-emergencia"
                                label="do contato"
                                renderItem={(contact) => (
                                    <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
                                        <h3 className="text-lg font-semibold text-gray-800">{contact.name}</h3>

                                        <div className="text-sm text-gray-600 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                📞 <span>{contact.phone || "Não cadastrado"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                ✅ <span>É TJ? {contact.isTj ? "Sim" : "Não"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
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