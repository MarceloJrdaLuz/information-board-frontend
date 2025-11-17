import Button from "@/Components/Button"
import DropdownObject from "@/Components/DropdownObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { usePublisher } from "@/hooks/usePublisher"
import { ICongregationToTransferPublisher, IPublisher, ITransferPublishers } from "@/types/types"
import moment from "moment"
import { useState } from "react"
import { toast } from "react-toastify"

interface ITransferPublisherProps {
    initialPublisher: IPublisher
    allPublishers: IPublisher[]
}

export default function TransferPublishers({ initialPublisher, allPublishers }: ITransferPublisherProps) {
    const { transferPublishers } = usePublisher()
    const [step, setStep] = useState(1)
    const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([initialPublisher])
    const [congregationSelected, setCongregationSelected] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const { data: congregations } = useAuthorizedFetch<ICongregationToTransferPublisher[]>('/congregations/toTransfer', { allowedRoles: ["ADMIN_CONGREGATION"] })

    const filterCongregations = congregations?.filter(c => c.id !== initialPublisher.congregation.id)

    const handleAddPublisher = (publisher: IPublisher | null) => {
        if (!publisher) return
        if (selectedPublishers.some(p => p.id === publisher.id)) return

        setSelectedPublishers(prev => [...prev, publisher])
        setDropdownOpen(false)
    }

    const handleRemovePublisher = (id: string) => {
        setSelectedPublishers(prev => prev.filter(p => p.id !== id))
    }

    const handleFinish = async () => {
        if (!congregationSelected) return

        const ids = selectedPublishers.map(p => p.id)

        const payload: ITransferPublishers = {
            publisherIds: ids ,
            newCongregationId: congregationSelected
        }
        toast.promise(transferPublishers(payload), {
            pending: "Transferindo publicador..."
        })
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-8 space-y-10">

            {/* ---------- STEP INDICATOR ---------- */}
            <div className="flex items-center justify-center gap-4">
                {[1, 2].map(n => (
                    <div key={n} className="flex flex-col items-center justify-center gap-2">
                        <span className={`${step === n ? "text-primary-200" : "text-typography-700"} font-semibold`}>Etapa {n}</span>
                        <div
                            key={n}
                            className={`h-2 w-32 rounded-full transition-all
                            ${step === n ? "bg-primary-200 shadow-md" : "bg-surface-100"}`}
                        />
                    </div>
                ))}
            </div>

            {/* ---------- STEP 1 ---------- */}
            {step === 1 && (
                <div className="space-y-8 bg-surface-100 rounded-2xl shadow-md p-5">

                    <h2 className="text-xl font-semibold text-typography-800">
                        Seleção de publicadores
                    </h2>

                    {/* CARDS */}
                    <div className="space-y-4 bg-surface-100 rounded-2xl">
                        {selectedPublishers.map((p) => (
                            <div
                                key={p.id}
                                className="p-5 bg-surface-100 border border-surface-300 rounded-xl shadow-sm flex items-center justify-between"
                            >
                                <div className="flex flex-col gap-3">
                                    <p className="font-semibold text-typography-800 text-base">
                                        {p.fullName}
                                    </p>
                                    {p.birthDate && <p className="flex flex-col font-semibold text-typography-800 text-base">
                                        Data de nascimento
                                        <span className="text-typography-500 text-sm font-normal">
                                            {moment(p.birthDate).format("DD/MM/YYYY")}
                                        </span>
                                    </p>}
                                    {p.dateImmersed && <p className="flex flex-col font-semibold text-typography-800 text-base">
                                        Data de batismo
                                        <span className="text-typography-500 text-sm font-normal">
                                            {moment(p.dateImmersed).format("DD/MM/YYYY")}
                                        </span>
                                    </p>}
                                </div>

                                {p.id !== initialPublisher.id && (
                                    <button
                                        onClick={() => handleRemovePublisher(p.id)}
                                        className="text-red-500 text-sm hover:text-red-600 hover:underline"
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* BUTTON ADD */}
                    <div className="flex flex-col gap-4">

                        {!dropdownOpen && (
                            <Button
                                onClick={() => setDropdownOpen(true)}
                                className="px-5 py-2.5 bg-primary-200 text-typography-200 rounded-lg shadow hover:bg-primary-100 transition"
                            >
                                Adicionar publicador
                            </Button>
                        )}

                        {dropdownOpen && (
                            <div className="p-4 border border-surface-300 bg-surface-100 rounded-xl shadow-sm">

                                <DropdownObject<IPublisher>
                                    title="Selecionar publicador"
                                    items={allPublishers}
                                    selectedItem={null}
                                    handleChange={(item) => handleAddPublisher(item)}
                                    labelKey="fullName"
                                    searchable
                                    full
                                />
                            </div>
                        )}
                    </div>

                    {/* NEXT BUTTON */}
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setStep(2)}
                            className="px-6 py-2.5 bg-primary-200 text-typography-200 rounded-lg shadow hover:bg-primary-100 transition"
                        >
                            Próximo
                        </Button>
                    </div>
                </div>
            )}

            {/* ---------- STEP 2 ---------- */}
            {step === 2 && (
                <div className="space-y-8 bg-surface-100 rounded-2xl shadow-md p-5">

                    <h2 className="text-xl font-semibold text-typography-800">
                        Selecionar congregação de destino
                    </h2>

                    <div className="p-4 bg-surface-100 border border-surface-200 rounded-xl shadow-sm">

                        <DropdownObject<ICongregationToTransferPublisher>
                            title="Congregação"
                            items={filterCongregations ?? []}
                            selectedItem={congregations?.find(c => c.id === congregationSelected) ?? null}
                            handleChange={(item) => setCongregationSelected(item?.id ?? "")}
                            labelKey="name"
                            labelKeySecondary="city"
                            searchable
                            full
                        />
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex justify-between">

                        <Button
                            outline
                            onClick={() => setStep(1)}
                            className="px-6 py-2.5 bg-surface-100 text-typography-700 rounded-lg shadow hover:bg-surface-200 transition"
                        >
                            Voltar
                        </Button>

                        <Button
                            onClick={handleFinish}
                            className="px-6 py-2.5 bg-primary-200 text-white rounded-lg shadow hover:bg-primary-100 transition"
                        >
                            Finalizar transferência
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
