import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import DropdownObject from "@/Components/DropdownObjects"
import GroupPublishers from "@/Components/GroupPublishers"
import Layout from "@/Components/Layout"
import { buttonDisabled, crumbsAtom, errorFormSend, groupPublisherList, pageActiveAtom, selectedPublishersAtom, successFormSend } from "@/atoms/atom"
import { AuthContext } from "@/context/AuthContext"
import { useSubmitContext } from "@/context/SubmitFormContext"
import { IPublisher } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { getAPIClient } from "@/services/axios"
import { useAtom, useAtomValue } from "jotai"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function MudarDirigente() {
    const { group_id, group_number } = useRouter().query
    const { user, roleContains } = useContext(AuthContext)
    const congregationUser = user?.congregation
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { handleSubmitSuccess, handleSubmitError } = useSubmitContext()

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const fetchConfigPublishers = congregationUser ? `/publishers/congregationId/${congregationUser?.id}` : ''
    const { data: getPublishers, mutate } = useFetch<IPublisher[]>(fetchConfigPublishers)

    const changeGroupOverseer = async () => {
        await api.put(`/group/${group_id}/change-groupOverseer`, {
            publisher_id: selectedPublisher?.id
        }).then(res => {
            toast.success("Dirigente do grupo atualizado com sucesso!")
            handleSubmitSuccess()
            setSelectedPublisher(null)
            mutate()
        }).catch(err => {
            toast.error('Ocorreu um erro no servidor!')
            handleSubmitError()
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
            { label: 'Editar grupo', link: `/grupos/${group_id}/add-publicadores?group_number=${group_number}` },
            ]
            return updatedCrumbs;
        })

        const removeCrumb = () => {
            setCrumbs((prevCrumbs) => prevCrumbs.slice(0, -1));
        };

        return () => {
            removeCrumb()
        }
    }, [setCrumbs, group_id, group_number])

    useEffect(() => {
        setPageActive('Mudar dirigente')
    }, [setPageActive])

    return (
        <Layout pageActive="grupos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <div className="flex justify-between w-full">
                            {group_number && <h1 className="p-4 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">{`Grupo ${group_number}`}</h1>}

                        </div>
                        <div className={`flex z-0 w-full h-full sm:h-9/12 min-h-[450px]  max-w-[600px] justify-center items-center bg-white p-6 md:p-8 md:justify-center md:items-center shadow-neutral-300 rounded-xl lg:w-10/12 md:w-11/12 md:h-fit mx-auto `}>
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
        </Layout >
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