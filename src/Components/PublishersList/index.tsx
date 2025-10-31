import { useAuthContext } from "@/context/AuthContext"
import { usePublisherContext } from "@/context/PublisherContext"
import { isAuxPioneerMonthNow } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IPublisher, Privileges, Situation } from "@/types/types"
import { ChevronDownIcon, Trash } from "lucide-react"
import moment from "moment"
import Image from "next/image"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import avatarFemale from '../../../public/images/avatar-female.png'
import avatarMale from '../../../public/images/avatar-male.png'
import Button from "../Button"
import CheckboxBoolean from "../CheckboxBoolean"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import FilterPrivileges from "../FilterPrivileges"
import EditIcon from "../Icons/EditIcon"
import SkeletonPublishersWithAvatarList from "./skeletonPublisherWithAvatarList"

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
                            <div className="flex flex-wrap gap-2">
                                {publisher.privileges.map(privilege => {
                                    if (privilege === Privileges.PIONEIROAUXILIAR) {
                                        if (isAuxPioneerMonthNow(publisher)) {
                                            return (
                                                <span className="bg-[#74706d] h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                    {privilege}
                                                </span>
                                            )
                                        } else {
                                            return (
                                                <span className="bg-[#74706d]  h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                    {Privileges.PUBLICADOR}
                                                </span>
                                            ) // Não exibe "Pioneiro Auxiliar" se não for o mês atual
                                        }
                                    } else if ((privilege === Privileges.PIONEIROREGULAR || privilege === Privileges.AUXILIARINDETERMINADO)) {
                                        if (isPioneerNow(publisher, new Date())) {
                                            return (
                                                <span className="bg-[#74706d] h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                    {privilege}
                                                </span>
                                            )
                                        } else {
                                            return null // Não exibe "Pioneiro Auxiliar" se não for o mês atual
                                        }
                                    } else {
                                        return (
                                            <span className="bg-[#74706d]  h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>
                                                {privilege}
                                            </span>
                                        )
                                    }
                                })}
                                {publisher.situation !== Situation.ATIVO && (
                                    <span className="bg-[#74706d] h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + publisher.situation}`}>
                                        {publisher.situation}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col w-full gap-4 mt-4">
                                {/* Apelido */}
                                {publisher.nickname && (
                                    <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
                                        <span className="text-xl">🏷️</span>
                                        <div className="flex flex-col">
                                            <span className="text-primary-200 font-semibold text-sm">Apelido</span>
                                            <span className="text-typography-100 font-medium">{publisher.nickname}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Esperança */}
                                <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
                                    <span className="text-xl">⭐</span>
                                    <div className="flex flex-col">
                                        <span className="text-primary-200 font-semibold text-sm">Esperança</span>
                                        <span className="text-typography-100 font-medium">{publisher.hope}</span>
                                    </div>
                                </div>

                                {/* Data do Batismo */}
                                <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
                                    <span className="text-xl">📅</span>
                                    <div className="flex flex-col">
                                        <span className="text-primary-200 font-semibold text-sm">Data do Batismo</span>
                                        <span className="text-typography-100 font-medium">{publisher.dateImmersed ? moment(publisher.dateImmersed).format('DD-MM-YYYY') : "Não informado"}</span>
                                    </div>
                                </div>

                                {/* Data de Nascimento */}
                                <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
                                    <span className="text-xl">📅</span>
                                    <div className="flex flex-col">
                                        <span className="text-primary-200 font-semibold text-sm">Data de Nascimento</span>
                                        <span className="text-typography-100 font-medium">{publisher.birthDate ? moment(publisher.birthDate).format('DD-MM-YYYY') : "Não informado"}</span>
                                    </div>
                                </div>

                                {/* Telefone */}
                                <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
                                    <span className="text-xl">📞</span>
                                    <div className="flex flex-col">
                                        <span className="text-primary-200 font-semibold text-sm">Telefone</span>
                                        <span className="text-typography-100 font-medium">{publisher.phone || "Não informado"}</span>
                                    </div>
                                </div>

                                {/* Endereço */}
                                <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center gap-3">
                                    <span className="text-xl">🏠</span>
                                    <div className="flex flex-col">
                                        <span className="text-primary-200 font-semibold text-sm">Endereço</span>
                                        <span className="text-typography-100 font-medium">{publisher.address || "Não informado"}</span>
                                    </div>
                                </div>

                                {/* Contato de emergência */}
                                <div className="p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">☎️</span>
                                        <span className="text-primary-200 font-semibold text-sm">Contato de emergência</span>
                                    </div>
                                    {publisher.emergencyContact ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-typography-100">
                                            <div><span className="font-semibold text-primary-200 text-sm">Nome:</span> {publisher.emergencyContact.name}</div>
                                            <div><span className="font-semibold text-primary-200 text-sm">Telefone:</span> {publisher.emergencyContact.phone}</div>
                                            <div><span className="font-semibold text-primary-200 text-sm">Relacionamento:</span> {publisher.emergencyContact.relationship}</div>
                                            <div><span className="font-semibold text-primary-200 text-sm">É TJ?:</span> {publisher.emergencyContact.isTj ? "Sim" : "Não"}</div>
                                        </div>
                                    ) : (
                                        <div className="text-typography-100 mt-2">Nenhum contato de emergência adicionado!</div>
                                    )}
                                </div>
                            </div>


                            <div className="flex mt-5">
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
                            <div className="flex justify-end my-5">
                                <span className="flex text-gray-600 font-semibold text-xs">Atualizado em: {moment(publisher.updated_at).format("DD-MM-YYYY")}</span>
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