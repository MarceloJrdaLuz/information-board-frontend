import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmergencyContactIcon from "@/Components/Icons/PhoneContactIcon"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonContactsEmergencyList from "@/Components/SkeletonContactsEmergency"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteEmergencyContactAtom } from "@/atoms/emergencyContactAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IEmergencyContact } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"
import { toast } from "react-toastify"

function EmergencyContactsPage() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const deleteEmergencyContact = useSetAtom(deleteEmergencyContactAtom)

    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const fetchConfig = congregation_id ? `/emergencyContacts/${congregation_id}` : ""
    const { data: emergencyContacts, mutate, isLoading } = useAuthorizedFetch<IEmergencyContact[]>(fetchConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"]
    })

    useEffect(() => {
        setPageActive('Contatos de emergência')
    }, [setPageActive])

    function handleDelete(emergencyContact_id: string) {
        toast.promise(deleteEmergencyContact(emergencyContact_id), {
            pending: 'Excluindo contato...',
        })
    }

    let skeletonContactEmergencyList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pb-36 w-full">
                {skeletonContactEmergencyList.map((a, i) => (<SkeletonContactsEmergencyList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Contatos de Emergência"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Contatos de emergência</h1>
                    <div className="flex">
                        <Button
                            outline
                            onClick={() => {
                                Router.push('/congregacao/contatos-emergencia/add')
                            }}
                            className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                            <EmergencyContactIcon />
                            <span className="text-primary-200 font-semibold">Criar contato</span>
                        </Button>
                    </div>
                    {emergencyContacts ?
                        <ListGeneric
                            onDelete={(item_id) => handleDelete(item_id)}
                            items={emergencyContacts}
                            path="/congregacao/contatos-emergencia"
                            label="do contato"
                            renderItem={(contact) => (
                                <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
                                    <h3 className="text-lg font-semibold text-typography-800">{contact.name}</h3>

                                    <div className="text-sm text-typography-700 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            📞 <span>{contact.phone || "Não cadastrado"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            ✅ <span>É TJ? {contact.isTj ? "Sim" : "Não"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        /> : (
                            renderSkeleton()
                        )
                    }
                </div>
            </section>
        </ContentDashboard>
    )
}

EmergencyContactsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER"])

export default EmergencyContactsPage