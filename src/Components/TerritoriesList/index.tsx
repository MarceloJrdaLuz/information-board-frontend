import { useAuthContext } from "@/context/AuthContext"
import { useTerritoryContext } from "@/context/TerritoryContext"
import { ITerritory } from "@/entities/territory"
import { sortByCompletionDate } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { ChevronDownIcon, CircleIcon, FileClockIcon, InfoIcon, Trash } from "lucide-react"
import moment from "moment"
import Image from "next/image"
import Router from "next/router"
import { useEffect, useState } from "react"
import mapGeneric from '../../../public/images/mapGeneric.png'
import Button from "../Button"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import FullScreenImage from "../FullScreenImage"
import EditIcon from "../Icons/EditIcon"
import SkeletonPublishersWithAvatarList from "./skeletonPublisherWithAvatarList"

export default function TerritoriesList() {
    const { user, roleContains } = useAuthContext()
    const { deleteTerritory, territoriesHistory } = useTerritoryContext()
    const congregationId = user?.congregation.id

    const [territories, setTerritories] = useState<ITerritory[]>()
    const [selectedTerritories, setSelectedTerritories] = useState<Set<string>>(new Set())

    const fetch = congregationId ? `/territories/${congregationId}` : ""
    const { data } = useFetch<ITerritory[]>(fetch)

    useEffect(() => {
        if (data) {
            data.sort((a, b) => a.number - b.number)
            setTerritories(data)
        }
    }, [data])

    async function onDelete(territory_id: string) {
        deleteTerritory({
            territory_id
        })
    }

    const handleShowDetails = (territory: ITerritory) => {
        const updatedSelectedTerritories = new Set(selectedTerritories)
        if (selectedTerritories.has(territory.id)) {
            updatedSelectedTerritories.delete(territory.id)
        } else {
            updatedSelectedTerritories.add(territory.id)
        }
        setSelectedTerritories(updatedSelectedTerritories)
    }

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
            <ul className="flex flex-wrap justify-center items-center w-full">
                {territories && territories.length > 0 ? territories?.map(territory =>
                    <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full  text-typography-100 min-w-[270px] m-1 ${selectedTerritories.has(territory.id) ? 'h-auto' : ''}`} key={`${territory.id}`}>
                        <div className="flex w-full justify-between items-center">
                            <div className="flex items-center p-6 text-base xs:px-2">
                                <span className="font-bold">{`Território ${territory.number}: ${territory.name}`}</span>
                            </div>
                            <div className="flex justify-center items-center gap-2 xs:gap-4">
                                <span>
                                    {(() => {
                                        const relevantHistory = territoriesHistory?.find(
                                            (history) =>
                                                history.territory.id === territory.id &&
                                                history.completion_date === null
                                        )

                                        return relevantHistory ? (
                                            <div className="flex justify-center items-center  h-full gap-2 xs:gap-4">
                                                <span className="text-sm text-center text-success-100">
                                                    {relevantHistory.caretaker}
                                                </span>
                                                <CircleIcon className="bg-success-100 rounded-full text-success-100 w-4 h-4" />
                                            </div>
                                        ) : (
                                            <CircleIcon className="bg-red-600 rounded-full text-red-600 w-4 h-4" />
                                        )
                                    })()}
                                </span>
                                <FileClockIcon className="text-primary-200 hover:text-primary-100" onClick={() => Router.push(`/territorios/historico/${territory.id}`)} />
                                <button className={`w-6 h-6 mx-2 sm:mx-4 flex justify-center items-center text-typography-100 hover:text-primary-200  ${selectedTerritories.has(territory.id) && 'rotate-180'}`} onClick={() => handleShowDetails(territory)}><ChevronDownIcon /> </button>
                            </div>
                        </div>
                        <div className={` w-full overflow-hidden duration-500 transition-height ${selectedTerritories.has(territory.id) ? 'h-auto pb-5 bg-white' : 'h-0'}`}>
                            <div className="flex-col flex-wrap m-4">
                                <div className={`relative w-full h-60 mb-4`}>
                                    {territory.image_url ?
                                        <FullScreenImage alt={`Imagem do território ${territory.name}`} src={territory.image_url} key={territory.id} />
                                        // <Image style={{ objectFit: 'contain' }} alt={`Imagem do território ${territory.name}`} src={territory.image_url} fill />
                                        :
                                        <div className="relative flex w-full h-full justify-center items-center">
                                            <Image style={{ objectFit: 'contain' }} alt={`Imagem do território ${territory.name}`} src={mapGeneric} fill />
                                            <div className="flex items-center justify-center">
                                                <span className="absolute text-center text-white bg-black bg-opacity-50 px-2 py-1 rounded">Sem foto</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <span className="my-2">{`Referência: ${territory.description}`}</span>
                                <div>
                                    {(() => {
                                        const relevantHistory = territoriesHistory?.filter(
                                            (history) => history.territory.id === territory.id
                                        ) ?? []

                                        const sortedHistory = sortByCompletionDate(relevantHistory)
                                        const lastCompletedHistory = sortedHistory.length > 0 ? sortedHistory[0] : null

                                        // Verifica se a data é válida com o moment
                                        const formattedDate = lastCompletedHistory?.completion_date
                                            ? moment(lastCompletedHistory.completion_date).format("DD/MM/YYYY")
                                            : null;

                                        // Se a data for inválida, mostra "Território em aberto"
                                        const displayDate = formattedDate && moment(formattedDate, "DD/MM/YYYY", true).isValid()
                                            ? formattedDate
                                            : "Território em aberto";

                                        return (
                                            <span>
                                                {`Concluído por último em: `}
                                                <span className="text-sm text-center text-success-100">
                                                    {displayDate}
                                                </span>
                                            </span>
                                        );
                                    })()}
                                </div>


                            </div>
                            <div className="flex pl-10">
                                <div className="gap-1 flex">
                                    {roleContains("TERRITORIES_MANAGER") || roleContains("ADMIN_CONGREGATION") &&
                                        <Button
                                            className="w-30"
                                            onClick={() => Router.push(`/territorios/edit/${territory.id}`)}
                                            outline
                                        >
                                            <EditIcon />
                                            Editar
                                        </Button>}
                                    {roleContains("TERRITORIES_MANAGER") || roleContains("ADMIN_CONGREGATION") &&
                                        <ConfirmDeleteModal
                                            onDelete={() => onDelete(`${territory.id}`)}
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
                    // renderSkeleton()
                    <div className="flex text-gray-800 border-l-4 border-[1px] border-primary-200 mb-4 mx-0 p-2 ">
                        <span className="h-full pr-1">
                            <InfoIcon className="p-0.5 text-primary-200" />
                        </span>
                        <span>Nenhum território cadastrado nessa congregação.</span>
                    </div>
                )}
            </ul>
        </>
    )
}