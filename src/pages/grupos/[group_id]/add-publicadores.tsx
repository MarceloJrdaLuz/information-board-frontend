import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import GroupPublishers from "@/Components/GroupPublishers"
import Layout from "@/Components/Layout"
import { crumbsAtom, groupPublisherList, pageActiveAtom, selectedPublishersAtom } from "@/atoms/atom"
import { AuthContext } from "@/context/AuthContext"
import { IPublisher } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function AddPublicadoresGrupo() {
    const { group_id, group_number } = useRouter().query
    const { user, roleContains } = useContext(AuthContext)
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)


    const [selectedPublishers, setSelectedPublishers] = useAtom(selectedPublishersAtom)
    const [groupPublisherListOption, setGroupPublisherListOption] = useAtom(groupPublisherList)

    const [groupPublishers, setGroupPublishers] = useState<IPublisher[]>()
    const [publishersWithoutGroup, setPublishersWithoutGroup] = useState<IPublisher[]>()
    const [publishersOthersGroup, setPublishersOthersGroup] = useState<IPublisher[]>()

    const [listPublishersWithoutGroupShow, setListPublishersWithoutGroupShow] = useState(true)
    const [listPublishersOthersGroupsShow, setListPublishersOthersGroupsShow] = useState(true)
    const [listGroupPublishersShow, setListGroupPublishersShow] = useState(true)

    const fetchConfigPublishers = congregationUser ? `/publishers/congregationId/${congregationUser?.id}` : ''
    const { data: getPublishers, mutate } = useFetch<IPublisher[]>(fetchConfigPublishers)

    const addPublishersGroup = async () => {
        await api.post(`/group/${group_id}/add-publishers`, {
            publishers_ids: selectedPublishers
        }).then(res => {
            toast.success("Publicadores adicionados ao grupo com sucesso!")
            setSelectedPublishers([])
            setGroupPublisherListOption('disabled')
            mutate()
        }).catch(err => {
            toast.error('Ocorreu um erro no servidor!')
        })
    }

    const removePublishersGroup = async () => {
        await api.delete(`/group/${group_id}/remove-publishers`, {
            data: {
                publishers_ids: selectedPublishers
            }
        }).then(res => {
            toast.success("Publicadores removidos do grupo com sucesso!")
            setSelectedPublishers([])
            setGroupPublisherListOption('disabled')
            mutate()
        }).catch(err => {
            toast.error('Ocorreu um erro no servidor!')
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
            setPublishersOthersGroup(filterPublishersOthersGroups)
            setPublishersWithoutGroup(filterPublisherWithoutGroup)
            setGroupPublishers(filterPublishersGroup)

        }
    }, [group_id, getPublishers, setGroupPublishers])

    useEffect(() => {
        setCrumbs((prevCrumbs) => {
            const updatedCrumbs = [...prevCrumbs, { label: 'Grupos', link: '/grupos' }];
            return updatedCrumbs;
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1));
        };

        return () => {
            removeCrumb()
        }
    }, [setCrumbs])

    useEffect(() => {
        setPageActive('Editar grupo')
    }, [setPageActive])

    return (
        <Layout pageActive="grupos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <div className="flex justify-between w-full">
                    {group_number && <h1 className="p-4 text-2xl text-primary-200 font-semibold">{`Grupo ${group_number}`}</h1>}

                    <div className="flex flex-col">
                        <span onClick={() => {
                            setGroupPublisherListOption('add-publishers')
                            setSelectedPublishers([])
                        }} className={`text-primary-200 p-4 text-lg font-semibold cursor-pointer`}>{'Adicionar publicadores'}</span>
                        <span onClick={() => {
                            setGroupPublisherListOption('remove-publishers')
                            setSelectedPublishers([])
                        }} className={`text-red-600 p-4 text-lg font-semibold cursor-pointer`}>{'Remover publicadores'}</span>
                    </div>
                </div>
                <div className={`flex flex-col px-4 flex-wrap`}>
                    <div className="flex flex-col lg:flex-row lg:justify-around gap-4">
                        {groupPublisherListOption !== 'invisible' && groupPublisherListOption !== 'add-publishers' && (
                            <div className={`flex flex-col ${groupPublisherListOption === 'remove-publishers' || groupPublisherListOption === 'disabled' ? 'w-full md:w-10/12 m-auto' : 'w-auto'} h-96`}>
                                <div className="flex justify-between font-bold bg-primary-100 p-4  text-white ">
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
                                {listGroupPublishersShow && groupPublishers && groupPublishers.length > 0 &&
                                    <GroupPublishers key="publishersGroup" publishers={groupPublishers} group_id={group_id as string} />
                                }
                            </div>
                        )}
                        {publishersOthersGroup && publishersOthersGroup.length > 0 && groupPublisherListOption === 'add-publishers' && (
                            <div className="flex flex-col h-96">
                                <div className="flex justify-between font-bold bg-primary-100 p-4  text-white ">
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
                            <div className="flex flex-col h-96">
                                <div className="flex justify-between font-bold bg-primary-100 p-4  text-white ">
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
                        <div className={`flex justify-center items-center m-auto w-fit h-12 mt-[10%]`}>
                            <Button onClick={groupPublisherListOption === 'add-publishers' ? addPublishersGroup : removePublishersGroup} color={`${groupPublisherListOption === 'remove-publishers' ? 'bg-red-400' : 'bg-primary-200'} hover:opacity-90 text-secondary-100 hover:text-black`} hoverColor='bg-button-hover' title={`${groupPublisherListOption === 'remove-publishers' ? 'Remover do grupo' : 'Adicionar ao grupo'}`} />
                        </div>}
                </div>
            </ContentDashboard>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)
    const { ['user-roles']: userRoles } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
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