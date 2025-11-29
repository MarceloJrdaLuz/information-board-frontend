import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import DropdownObject from "@/Components/DropdownObjects"
import { buttonDisabled, crumbsAtom, errorFormSend, pageActiveAtom, successFormSend } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IPublisher } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useAtomValue } from "jotai"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function ChangeGroupOverseer() {
    const { group_id, group_number } = useRouter().query
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { handleSubmitSuccess, handleSubmitError } = useSubmit()

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const fetchConfigPublishers = congregationUser ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}` : ''
    const { data: getPublishers, mutate } = useAuthorizedFetch<IPublisher[]>(fetchConfigPublishers, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER"]
    })

    const changeGroupOverseer = async () => {
        await api.put(`/group/${group_id}/change-groupOverseer`, {
            publisher_id: selectedPublisher?.id
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.groupOverseerUpdate)
            setSelectedPublisher(null)
            mutate()
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(message)
                handleSubmitError(messageSuccessSubmit.groupOverseerUpdate)
            }
        })
    }

    useEffect(() => {
        if (getPublishers) {
            const filterPublishersMale = getPublishers.filter(publisher => (publisher.gender === 'Masculino'))
            setPublishers(filterPublishersMale)
        }
    }, [getPublishers])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs,
            { label: 'Editar grupo', link: `/congregacao/grupos/${group_id}/add-publicadores?group_number=${group_number}` },
            ]
            return updatedCrumbs
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1))
        }

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, group_id, group_number])

    useEffect(() => {
        setPageActive('Mudar dirigente')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Mudar Dirigente"} />
            <section className="flex flex-wrap w-full h-full p-5 ">
                <div className="w-full h-full">
                    <div className="flex justify-between w-full">
                        {group_number && <h1 className="p-4 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">{`Grupo ${group_number}`}</h1>}

                    </div>
                    <div className={`flex z-0 w-full h-fite sm:h-9/12 min-h-[450px]  max-w-[600px] justify-center items-center bg-surface-100 p-6 md:p-8 md:justify-center md:items-center shadow-neutral-300 rounded-xl lg:w-10/12 md:w-11/12 md:h-fit mx-auto `}>
                        <div className={`w-full h-fit flex-col justify-center items-center`}>
                            <h2 className="mb-6  w-11/12 font-semibold  sm:text-2xl text-primary-200">Escolha o dirigente</h2>
                            {publishers && (
                                <DropdownObject<IPublisher>
                                    title="Dirigente do grupo"
                                    items={publishers}
                                    selectedItem={selectedPublisher}
                                    handleChange={setSelectedPublisher}
                                    labelKey="fullName"
                                    labelKeySecondary="nickname"
                                    border
                                    textVisible
                                    full
                                    textAlign='left'
                                    searchable
                                />
                            )}
                        </div>

                    </div>
                    <div className={`flex justify-center w-full mt-2`}>
                        <Button error={dataError} disabled={disabled} success={dataSuccess} onClick={() => changeGroupOverseer()}>
                            Atualizar
                        </Button>
                    </div>
                </div>
            </section>
        </ContentDashboard>
    )
}

ChangeGroupOverseer.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "GROUPS_MANAGER"])

export default ChangeGroupOverseer