import { AuthContext } from "@/context/AuthContext"
import { IPublisher } from "@/entities/types"
import { useContext, useEffect, useState } from "react"
import Image from "next/image"
import avatarMale from '../../../public/images/avatar-male.png'
import avatarFemale from '../../../public/images/avatar-female.png'
import { iconeEdit } from "@/assets/icons"
import Router, { useRouter } from "next/router"
import { useFetch } from "@/hooks/useFetch"
import { ChevronDownIcon } from "lucide-react"

export default function PublisherList() {
    const { user } = useContext(AuthContext)
    const congregationUser = user?.congregation

    const router = useRouter()

    const { data, mutate } = useFetch<IPublisher[]>(`/publishers/congregationId/${congregationUser?.id}`)

    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [loading, setLoading] = useState(true)
    const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set())


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
        setPublishers(data)
    }, [data])

    useEffect(() => {
        mutate() // Refetch dos dados utilizando a função mutate do useFetch sempre que muda a rota
    }, [selectedPublishers, router.asPath, mutate])


    return (
        <ul className="flex flex-wrap justify-center items-center w-full">
            {publishers?.map(publisher =>
                <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-10/12  m-1 ${selectedPublishers.has(publisher.id) ? 'h-auto' : ''}`} key={`${publisher.id}`}>
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
                    <div className={` w-full overflow-hidden duration-500 transition-height ${selectedPublishers.has(publisher.id) ? 'h-auto py-5 bg-white' : 'h-0'}`}>                        {/* Exibir as informações adicionais aqui */}
                        <div className="h-fit pl-10">
                            {publisher.privileges.map(privilege => <span className="bg-[#74706d] mr-2 h-fit w-fit px-3 py-2 rounded-md text-white text-xs" key={`${publisher.id + privilege}`}>{privilege}</span>)}
                        </div>
                        <div className="flex mt-2">
                            <p className="p-10"><span className="text-primary-200 font-semibold">Apelido:</span> {publisher.nickname}</p>
                            <p className="p-10"><span className="text-primary-200 font-semibold">Esperança:</span> {publisher.hope}</p>
                            <p className="p-10"><span className="text-primary-200 font-semibold">Data do Batismo:</span> {publisher.dateImmersed?.toString() ?? "Não informado"}</p>
                        </div>
                        <div className="flex pl-10">
                            <button onClick={() => Router.push(`/publicadores/edit/${publisher.id}`)} className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3 my-5">{iconeEdit('#178582')} <span className="text-primary-200 font-semibold pl-1">Editar</span></button>
                        </div>
                    </div>
                </li>
            )}
        </ul>
    )
}