import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import GroupPublishers from "@/Components/GroupPublishers"
import GroupIcon from "@/Components/Icons/GroupIcon"
import GroupOverseersIcon from "@/Components/Icons/GroupOverseersIcon"
import { crumbsAtom, groupPublisherList, pageActiveAtom, selectedPublishersAtom } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IPublisher } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"

function AddPublishersToGroups() {
    const { group_id, group_number } = useRouter().query
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const [selectedPublishers, setSelectedPublishers] = useAtom(selectedPublishersAtom)
    const [groupPublisherListOption, setGroupPublisherListOption] = useAtom(groupPublisherList)

    const [groupPublishers, setGroupPublishers] = useState<IPublisher[]>()
    const [publishersWithoutGroup, setPublishersWithoutGroup] = useState<IPublisher[]>()
    const [publishersOthersGroup, setPublishersOthersGroup] = useState<IPublisher[]>()

    const [listPublishersWithoutGroupShow, setListPublishersWithoutGroupShow] = useState(true)
    const [listPublishersOthersGroupsShow, setListPublishersOthersGroupsShow] = useState(true)
    const [listGroupPublishersShow, setListGroupPublishersShow] = useState(true)

    const [dataSuccess, setDataSuccess] = useState(false)

    const fetchConfigPublishers = congregationUser ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}` : ''
    const { data: getPublishers, mutate } = useAuthorizedFetch<IPublisher[]>(fetchConfigPublishers, {
        allowedRoles: ["ADMIN_CONGREGATION", "GROUPS_MANAGER"]
    })

    const addPublishersGroup = async () => {
        await api.post(`/group/${group_id}/add-publishers`, {
            publishers_ids: selectedPublishers
        }).then(res => {
            mutate()
            handleSubmitSuccess(messageSuccessSubmit.publisherAddGroup)
        }).catch(err => {
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    const removePublishersGroup = async () => {
        await api.delete(`/group/${group_id}/remove-publishers`, {
            data: {
                publishers_ids: selectedPublishers
            }
        }).then(res => {
            mutate()
            handleSubmitSuccess(messageSuccessSubmit.publisherRemoveGroup)
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

    useEffect(() => {
        if (getPublishers) {
            const filterPublishersGroup = getPublishers.filter(publisher => {
                if (publisher.group) {
                    return (
                        publisher.group.id === group_id
                    )
                }
            })

            const filterPublishersOthersGroups = getPublishers.filter(publisher => {
                if (publisher.group) {
                    return (
                        publisher.group.id !== group_id
                    )
                }
            })

            const filterPublisherWithoutGroup = getPublishers.filter(publihser => (
                !publihser.group
            ))

            setPublishersOthersGroup(sortArrayByProperty(filterPublishersOthersGroups, "fullName"))
            setPublishersWithoutGroup(sortArrayByProperty(filterPublisherWithoutGroup, "fullName"))
            setGroupPublishers(sortArrayByProperty(filterPublishersGroup, "fullName"))

        }
        return () => {
            setGroupPublisherListOption('disabled')
        }
    }, [group_id, getPublishers, setGroupPublishers, setGroupPublisherListOption])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Grupos', link: '/congregacao/grupos' }]
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
        setPageActive('Editar grupo')
    }, [setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Adicionar Publicadores"} />
            <div className="flex justify-between w-full">
                {group_number && <h1 className="p-4 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">{`Grupo ${group_number}`}</h1>}

                <div className="flex justify-end p-2 gap-1 flex-wrap ">
                    <Button
                        outline
                        className="w-56"
                        onClick={() => Router.push({
                            pathname: `/congregacao/grupos/${group_id}/mudar-dirigente`,
                            query: { group_number: `${group_number}` }
                        })}
                    >
                        <GroupOverseersIcon />
                        Mudar dirigente
                    </Button>
                    <Button
                        outline
                        className={` w-56 ${groupPublisherListOption === 'add-publishers' && 'border-primary-200'}`}
                        onClick={() => {
                            setGroupPublisherListOption('add-publishers')
                            setSelectedPublishers([])
                        }}
                    >
                        <GroupIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                        Adicionar Publicadores
                    </Button>

                    <Button
                        outline
                        remove={groupPublisherListOption === 'remove-publishers'}
                        className={`w-56  `}
                        onClick={() => {
                            setGroupPublisherListOption('remove-publishers')
                            setSelectedPublishers([])
                        }} >Remover publicadores</Button>
                </div>
            </div>
            <div className={`flex flex-col px-4 flex-wrap`}>
                {(groupPublisherListOption === 'add-publishers' || groupPublisherListOption === 'remove-publishers') && <span className="py-4 text-primary-200 font-semibold">Selecione os publicadores</span>}
                <div className={`flex flex-col gap-4 ${groupPublisherListOption !== 'disabled' && 'lg:flex-row lg:justify-around'}`}>
                    {groupPublisherListOption !== 'add-publishers' && (
                        <div className={`flex flex-col ${groupPublisherListOption === 'remove-publishers' || groupPublisherListOption === 'disabled' ? 'w-full md:w-10/12 m-auto' : 'w-full'} h-[300px]`}>
                            <div className="flex justify-between font-bold bg-primary-100 p-4  text-typography-200 ">
                                <span>Publicadores atuais do grupo</span>
                                <span
                                    className="cursor-pointer"
                                    onClick={() => setListGroupPublishersShow(!listGroupPublishersShow)}>
                                    {listGroupPublishersShow ?
                                        <ChevronUpIcon />
                                        :
                                        <ChevronDownIcon />
                                    }
                                </span>
                            </div>
                            {listGroupPublishersShow && groupPublishers && groupPublishers.length > 0 ? (
                                <GroupPublishers key="publishersGroup" publishers={groupPublishers} group_id={group_id as string} />
                            ) : (
                                <div
                                    className={`my-1 w-full list-none  bg-typography-100 p-4`}
                                >
                                    Esse grupo está vazio no momento!
                                </div>
                            )

                            }
                        </div>
                    )}
                    {publishersOthersGroup && publishersOthersGroup.length > 0 && groupPublisherListOption === 'add-publishers' && (
                        <div className="flex flex-col h-[300px]">
                            <div className="flex justify-between font-bold bg-primary-100 p-4  text-typography-100">
                                <span>Publicadores de outros grupos</span>
                                <span
                                    className="cursor-pointer"
                                    onClick={() => setListPublishersOthersGroupsShow(!listPublishersOthersGroupsShow)}>
                                    {listPublishersOthersGroupsShow ?
                                        <ChevronUpIcon />
                                        :
                                        <ChevronDownIcon />
                                    }
                                </span>
                            </div>
                            {listPublishersOthersGroupsShow &&
                                <GroupPublishers publishers={publishersOthersGroup} group_id={group_id as string} />
                            }
                        </div>
                    )}
                    {publishersWithoutGroup && publishersWithoutGroup.length > 0 && groupPublisherListOption === 'add-publishers' && (
                        <div className="flex flex-col h-[300px]">
                            <div className="flex justify-between font-bold bg-primary-100 p-4  text-typography-200 ">
                                <span>Publicadores sem grupo</span>
                                <span
                                    className="cursor-pointer"
                                    onClick={() => setListPublishersWithoutGroupShow(!listPublishersWithoutGroupShow)}>
                                    {listPublishersWithoutGroupShow ?
                                        <ChevronUpIcon />
                                        :
                                        <ChevronDownIcon />
                                    }
                                </span>
                            </div>
                            {listPublishersWithoutGroupShow && <GroupPublishers publishers={publishersWithoutGroup} group_id={group_id as string} />}
                        </div>
                    )}
                </div>
                {groupPublisherListOption !== 'disabled' &&
                    <div className={`flex justify-center w-full mt-2`}>
                        <Button disabled={selectedPublishers.length === 0 && true} success={dataSuccess} remove={groupPublisherListOption === 'remove-publishers' && selectedPublishers.length > 0 && true} onClick={groupPublisherListOption === 'add-publishers' ? addPublishersGroup : removePublishersGroup}>{groupPublisherListOption === 'add-publishers' ? 'Adicionar' : 'Remover'}</Button>
                    </div>
                }

            </div>
        </ContentDashboard>
    )
}

AddPublishersToGroups.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "GROUPS_MANAGER"])

export default AddPublishersToGroups