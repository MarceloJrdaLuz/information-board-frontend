import { useAuthContext } from "@/context/AuthContext"
import { useTerritoryContext } from "@/context/TerritoryContext"
import { sortByCompletionDate } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { ITerritory } from "@/types/territory"
import { ChevronDownIcon, CircleIcon, FileClockIcon, Trash } from "lucide-react"
import moment from "moment"
import Image from "next/image"
import Router from "next/router"
import { useEffect, useState } from "react"
import mapGeneric from '../../../public/images/mapGeneric.png'
import Button from "../Button"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import EmptyState from "../EmptyState"
import FullScreenImage from "../FullScreenImage"
import EditIcon from "../Icons/EditIcon"
import SkeletonTerritoriesList from "./skeletonTerritoriesList"

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

    let skeletonTerritoriesList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center gap-2">
                {skeletonTerritoriesList.map((a, i) => (<SkeletonTerritoriesList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <>
            <ul className="flex flex-wrap justify-center w-full gap-4 mt-6 pb-20">
                {territories && territories.length > 0 ? (
                    territories.map((territory) => {
                        const isOpen = selectedTerritories.has(territory.id);
                        const activeHistory = territoriesHistory?.find(
                            (h) => h.territory.id === territory.id && h.completion_date === null
                        );

                        return (
                            <li
                                key={territory.id}
                                className={`
            bg-surface-100/70 hover:bg-surface-200 transition-all duration-300
            w-full sm:w-[95%] md:w-[48%] rounded-2xl shadow-sm hover:shadow-md
            border border-surface-300 overflow-hidden
          `}
                            >
                                {/* Cabeçalho */}
                                <div
                                    className="flex justify-between items-center px-6 py-4 cursor-pointer"
                                    onClick={() => handleShowDetails(territory)}
                                >
                                    <div className="flex flex-col">
                                        <h3 className="font-semibold text-lg text-typography-900">
                                            {`Território ${territory.number}: ${territory.name}`}
                                        </h3>
                                        <span className="text-sm text-typography-500 mt-1">
                                            {territory.description || "Sem descrição"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {activeHistory ? (
                                            <span className="flex items-center gap-1 text-success-100 text-sm">
                                                <CircleIcon className="fill-success-100 w-3 h-3" />
                                                {activeHistory.caretaker}
                                            </span>
                                        ) : (
                                            <CircleIcon className="fill-red-500 text-red-500 w-3 h-3" />
                                        )}

                                        <FileClockIcon
                                            className="text-primary-200 hover:text-primary-100 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                Router.push(`/congregacao/territorios/historico/${territory.id}`);
                                            }}
                                        />
                                        <ChevronDownIcon
                                            className={`w-5 h-5 text-typography-600 transition-transform ${isOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Detalhes */}
                                <div
                                    className={`grid transition-all duration-500 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="px-6 pb-6 space-y-4">
                                            <div className="relative w-full h-56 rounded-lg overflow-hidden bg-surface-200">
                                                {territory.image_url ? (
                                                    <FullScreenImage
                                                        alt={`Imagem do território ${territory.name}`}
                                                        src={territory.image_url}
                                                    />
                                                ) : (
                                                    <div className="flex justify-center items-center w-full h-full">
                                                        <Image
                                                            src={mapGeneric}
                                                            alt="Sem imagem"
                                                            fill
                                                            className="object-contain opacity-70"
                                                        />
                                                        <span className="absolute bg-typography-900/70 text-surface-100 px-3 py-1 rounded-lg">
                                                            Sem foto
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-sm text-typography-700">
                                                {(() => {
                                                    const relevantHistory =
                                                        territoriesHistory?.filter(
                                                            (h) => h.territory.id === territory.id
                                                        ) ?? [];

                                                    const sorted = sortByCompletionDate(relevantHistory);
                                                    const last = sorted[0];
                                                    const date = last?.completion_date
                                                        ? moment(last.completion_date).format("DD/MM/YYYY")
                                                        : "Território em aberto";

                                                    return (
                                                        <span>
                                                            Concluído por último em:{" "}
                                                            <span className="text-success-100 font-medium">
                                                                {date}
                                                            </span>
                                                        </span>
                                                    );
                                                })()}
                                            </div>

                                            {(roleContains("TERRITORIES_MANAGER") ||
                                                roleContains("ADMIN_CONGREGATION")) && (
                                                    <div className="flex gap-3 pt-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                Router.push(`/congregacao/territorios/edit/${territory.id}`)
                                                            }
                                                            outline
                                                        >
                                                            <EditIcon /> Editar
                                                        </Button>

                                                        <ConfirmDeleteModal
                                                            onDelete={() => onDelete(territory.id)}
                                                            button={
                                                                <Button size="sm" outline className="text-red-400">
                                                                    <Trash /> Excluir
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })
                ) : !territories ? (
                    renderSkeleton()
                ) : (
                    <EmptyState message="Nenhum território cadastrado nessa congregação!" />
                )}
            </ul>
        </>
    )
}
