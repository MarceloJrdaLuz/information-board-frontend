import { useAuthContext } from "@/context/AuthContext"
import { IPublisher, Privileges, Situation } from "@/entities/types"
import { useEffect, useState } from "react"
import Image from "next/image"
import avatarMale from '../../../public/images/avatar-male.png'
import avatarFemale from '../../../public/images/avatar-female.png'
import Router, { useRouter } from "next/router"
import { useFetch } from "@/hooks/useFetch"
import { ChevronDownIcon, Trash } from "lucide-react"
import Button from "../Button"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import EditIcon from "../Icons/EditIcon"
import { usePublisherContext } from "@/context/PublisherContext"
import { toast } from "react-toastify"
import moment from "moment"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { isAuxPioneerMonthNow } from "@/functions/isAuxPioneerMonthNow"
import FilterPrivileges from "../FilterPrivileges"
import SkeletonPublishersWithAvatarList from "./skeletonPublisherWithAvatarList"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import CheckboxBoolean from "../CheckboxBoolean"

export default function PublisherList() {
    const { user, roleContains } = useAuthContext()
    const { deletePublisher } = usePublisherContext()
    const congregationUser = user?.congregation

    const router = useRouter()
    const fetchConfig = congregationUser ? `/publishers/congregationId/${congregationUser?.id}` : ""
    const { data, mutate } = useFetch<IPublisher[]>(fetchConfig)

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set())
    const [filterPublishers, setFilterPublishers] = useState<IPublisher[]>()
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])

    const [filterSituation, setFilterSituation] = useState<string[]>([])
    const [inactivesShow, setInactivesShow] = useState(false)
    const [publishersOthers, setPublishersOthers] = useState<IPublisher[]>()


    const handleShowDetails = (publisher: IPublisher) => {
        const updatedSelectedPublishers = new Set(selectedPublishers)
        if (selectedPublishers.has(publisher.id)) {
            updatedSelectedPublishers.delete(publisher.id) // Publisher já está selecionado, remove da lista
        } else {
            updatedSelectedPublishers.add(publisher.id) // Publisher não está selecionado, adiciona à lista
        }
        setSelectedPublishers(updatedSelectedPublishers)
    }

    useEffect(() => {
        if (data) {
            const filterActives = data?.filter(publisher => publisher.situation === Situation.ATIVO)
            const filterOthers = data?.filter(publisher => (publisher.situation === Situation.INATIVO || publisher.situation === Situation.REMOVIDO || publisher.situation === Situation.DESASSOCIADO))
            const sortActives = sortArrayByProperty(filterActives, "fullName")
            const sortOthersSituation = sortArrayByProperty(filterOthers, "fullName")
            setPublishers(sortActives)
            setPublishersOthers(sortOthersSituation)
        }
    }, [data])

    useEffect(() => {
        mutate() // Refetch dos dados utilizando a função mutate do useFetch sempre que muda a rota
    }, [selectedPublishers, router.asPath, mutate])

    async function onDelete(publisher_id: string) {

        await toast.promise(deletePublisher(publisher_id), {
            pending: "Excluindo publicador..."
        }).then(() => {
            mutate()
            const updatedSelectedPublishers = new Set(selectedPublishers)
            if (updatedSelectedPublishers.has(publisher_id)) {
                updatedSelectedPublishers.delete(publisher_id)
            }

            setSelectedPublishers(updatedSelectedPublishers)
        })
    }

    const handleCheckboxChange = (filter: string[]) => {
        setFilterPrivileges(filter)
    }

    const handleCheckboxSituationChange = (filter: string[]) => {
        setFilterSituation(filter)
    }

    useEffect(() => {
        if (inactivesShow) {
            setFilterPublishers(publishersOthers)
            return
        }
        const filterPublishersToPrivileges = filterPrivileges.length > 0 ?
            publishers?.filter(publisher => {
                return (publisher.situation === Situation.ATIVO &&
                    filterPrivileges.every(privilege => {
                        if (privilege === Privileges.PIONEIROAUXILIAR) {
                            return publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonthNow(publisher)
                        } else if (privilege === Privileges.PIONEIROREGULAR) {
                            return publisher.privileges.includes(Privileges.PIONEIROREGULAR) && isPioneerNow(publisher, new Date())
                        } else if (privilege === Privileges.AUXILIARINDETERMINADO) {
                            return publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(publisher, new Date())
                        } else {
                            return publisher.privileges.includes(privilege)
                        }
                    })
                )
            }) : publishers?.filter(publisher => publisher.situation === Situation.ATIVO)
        setFilterPublishers(filterPublishersToPrivileges)
    }, [filterPrivileges, publishers, inactivesShow, publishersOthers])

    let skeletonPublishersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonPublishersList.map((a, i) => (<SkeletonPublishersWithAvatarList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <>
            <ul className="flex flex-wrap justify-center items-center w-full ">
                <div className="w-full md:w-10/12 flex justify-between items-center mt-4">
                    <CheckboxBoolean handleCheckboxChange={(check) => setInactivesShow(check)} checked={inactivesShow} label="Inativos" />
                    <FilterPrivileges checkedOptions={filterPrivileges} handleCheckboxChange={filter => handleCheckboxChange(filter)} />
                    {filterPublishers && <span className="flex my-3 pr-1 justify-end w-full md:w-10/12 text-primary-200 text-sm md:text-base font-semibold">Resultados: {filterPublishers?.length}</span>}
                </div>
                {filterPublishers && filterPublishers.length > 0 ? filterPublishers?.map(publisher =>
                    <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1 ${selectedPublishers.has(publisher.id) ? 'h-auto' : ''}`} key={`${publisher.id}`}>
                        <div className="flex w-full justify-between items-center">
                            <div className="flex items-center p-6 ">
                                {publisher.gender === "Masculino" ?
                                    <Image alt="Avatar de um homem" src={avatarMale} className="w-10 rounded-full bg-[#a4e6da]" />
                                    :
                                    <Image alt="Avatar de uma mulher" src={avatarFemale} className="w-10 rounded-full" />
                                }
                                <span className="pl-4 font-semi-bold">{publisher.fullName}</span>
                            </div>
                            <button className={`w-6 h-6 mr-4 flex justify-center items-center ${selectedPublishers.has(publisher.id) && 'rotate-180'}`} onClick={() => handleShowDetails(publisher)}><ChevronDownIcon /> </button>
                        </div>
                        <div className={`w-full overflow-hidden duration-500 transition-all ${selectedPublishers.has(publisher.id) ? 'h-auto px-8 py-2  bg-white' : 'h-0 px-8'}`}>                        {/* Exibir as informações adicionais aqui */}
                            <div className="h-fit ">
                                {publisher.privileges.map(privilege => {
                                    if (privilege === Privileges.PIONEIROAUXILIAR) {
                                        if (isAuxPioneerMonthNow(publisher)) {
                                            return (
                                                <span className="bg-[#74706d] mr-2 h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                    {privilege}
                                                </span>
                                            )
                                        } else {
                                            return (
                                                <span className="bg-[#74706d] mr-2 h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                    {Privileges.PUBLICADOR}
                                                </span>
                                            ) // Não exibe "Pioneiro Auxiliar" se não for o mês atual
                                        }
                                    } else if ((privilege === Privileges.PIONEIROREGULAR || privilege === Privileges.AUXILIARINDETERMINADO)) {
                                        if (isPioneerNow(publisher, new Date())) {
                                            return (
                                                <span className="bg-[#74706d] mr-2 h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                    {privilege}
                                                </span>
                                            )
                                        } else {
                                            return null // Não exibe "Pioneiro Auxiliar" se não for o mês atual
                                        }
                                    } else {
                                        return (
                                            <span className="bg-[#74706d] mr-2 h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                {privilege}
                                            </span>
                                        )
                                    }
                                })}
                                {publisher.situation !== Situation.ATIVO && (
                                    <span className="bg-[#74706d] mr-2 h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + publisher.situation}`}>
                                        {publisher.situation}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap w-full mt-4 text-sm sm:text-base">
                                {publisher.nickname && <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Apelido:</span> {publisher.nickname}</p>}
                                <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Esperança:</span> {publisher.hope}</p>
                                <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Data do Batismo:</span> {publisher.dateImmersed ? moment(publisher.dateImmersed?.toString()).format('DD-MM-YYYY') : "Não informado"}</p>
                                <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Data de Nascimento:</span> {publisher.birthDate ? moment(publisher.birthDate?.toString()).format('DD-MM-YYYY') : "Não informado"}</p>
                                {(publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) || publisher.privileges.includes(Privileges.PIONEIROREGULAR)) && <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Início como Pioneiro:</span> {publisher.startPioneer ? moment(publisher.startPioneer?.toString()).format('DD-MM-YYYY') : "Não informado"}</p>}
                                <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Telefone:</span> {publisher.phone ? publisher.phone : "Não informado"}</p>
                                <p className="p-4 font-semibold text-typography-100"><span className="text-primary-200 font-bold">Endereço:</span> {publisher.address ? publisher.address : "Não informado"}</p>
                                <div className='w-full m-2 border-t border-gray-300 my-4 p-2'>
                                    <span className="text-primary-200 font-semibold text-base sm:text-lg">Contato de emergência</span>
                                    {publisher.emergencyContact ? (
                                        <>
                                            <div className="flex flex-wrap justify-between text-typography-100">
                                                <div className="flex flex-col p-4">
                                                    <span className="text-primary-200 font-bold">Nome:</span>
                                                    <span>{publisher.emergencyContact?.name}</span>
                                                </div>
                                                <div className="flex flex-col p-4">
                                                    <span className="text-primary-200 font-bold">Telefone:</span>
                                                    <span>{publisher.emergencyContact?.phone}</span>
                                                </div>
                                                <div className="flex flex-col p-4">
                                                    <span className="text-primary-200 font-bold">Relacionamento:</span>
                                                    <span>{publisher.emergencyContact?.relationship}</span>
                                                </div>
                                                <div className="flex flex-col p-4">
                                                    <span className="text-primary-200 font-bold">É TJ?:</span>
                                                    <span>{publisher.emergencyContact?.isTj ? "Sim" : "Não"}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-center py-2">
                                            <span className="text-typography-100">Nenhum contato de emergência adicionado!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex">
                                <div className="gap-1 flex">
                                    {(roleContains("PUBLISHERS_MANAGER") || roleContains("ADMIN_CONGREGATION")) &&
                                        <Button
                                            className="w-30"
                                            onClick={() => Router.push(`/congregacao/publicadores/edit/${publisher.id}`)}
                                            outline
                                        >
                                            <EditIcon />
                                            Editar
                                        </Button>}
                                    {(roleContains("PUBLISHERS_MANAGER") || roleContains("ADMIN_CONGREGATION")) &&
                                        <ConfirmDeleteModal
                                            onDelete={() => onDelete(`${publisher.id}`)}
                                            button={<Button
                                                outline
                                                className="text-red-400 w-30"
                                            >
                                                <Trash />
                                                Excluir
                                            </Button>}
                                        />}
                                </div>

                            </div>
                        </div>
                    </li>
                ) : (
                    renderSkeleton()
                )}
            </ul>
        </>
    )
}