import AvatarFemale from "@/Components/AvatarFemale"
import DropdownObject from "@/Components/DropdownObjects"
import { Button } from "@/Components/ui/button"
import { getActivePrivilegeLabels } from "@/functions/publisherPrivilegeHelper"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { usePublisher } from "@/hooks/usePublisher"
import { ICongregationToTransferPublisher, IPublisher, ITransferPublishers } from "@/types/types"
import dayjs from "dayjs"
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Loader2,
    MapPin,
    Send,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users
} from "lucide-react"
import Image from "next/image"
import Router from "next/router"
import { useState } from "react"
import { toast } from "react-toastify"
import avatarMale from "../../../../public/images/avatar-male.png"

interface ITransferPublisherProps {
    initialPublisher: IPublisher
    allPublishers: IPublisher[]
}

export default function TransferPublishers({ initialPublisher, allPublishers }: ITransferPublisherProps) {
    const { transferPublishers } = usePublisher()
    const [step, setStep] = useState<1 | 2>(1)
    const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([initialPublisher])
    const [congregationSelected, setCongregationSelected] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: congregations, isLoading: loadingCongregations } = useAuthorizedFetch<
        ICongregationToTransferPublisher[]
    >("/congregations/toTransfer", { allowedRoles: ["ADMIN_CONGREGATION"] })

    const filterCongregations = congregations?.filter(
        (c) => c.id !== initialPublisher.congregation?.id
    )

    const selectedCongregationObj = congregations?.find(
        (c) => c.id === congregationSelected
    )

    const availablePublishers = allPublishers.filter(
        (p) => !selectedPublishers.some((sp) => sp.id === p.id)
    )

    const handleAddPublisher = (publisher: IPublisher | null) => {
        if (!publisher) return
        if (selectedPublishers.some((p) => p.id === publisher.id)) return

        setSelectedPublishers((prev) => [...prev, publisher])
        setDropdownOpen(false)
    }

    const handleRemovePublisher = (id: string) => {
        if (id === initialPublisher.id) return
        setSelectedPublishers((prev) => prev.filter((p) => p.id !== id))
    }

    const handleFinish = async () => {
        if (!congregationSelected || isSubmitting) return

        const ids = selectedPublishers.map((p) => p.id)

        const payload: ITransferPublishers = {
            publisherIds: ids,
            newCongregationId: congregationSelected
        }

        setIsSubmitting(true)
        try {
            await toast.promise(transferPublishers(payload), {
                pending: "Transferindo publicador(es)..."
            })
        } catch (err) {
            console.error("Erro ao transferir publicadores:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* ---------- STEPPER HEADER ---------- */}
            <div className="flex items-center justify-between gap-3 sm:gap-6 bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-sm">
                {/* Step 1 Pill */}
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-3 text-left group cursor-pointer transition-all"
                >
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shrink-0 ${
                            step === 1
                                ? "bg-primary-200 text-white shadow-sm ring-4 ring-primary-200/20"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        }`}
                    >
                        {step > 1 ? <Check className="w-5 h-5 stroke-[2.5]" /> : "1"}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`text-[11px] font-bold uppercase tracking-wider ${
                                    step === 1 ? "text-primary-200" : "text-typography-600"
                                }`}
                            >
                                Etapa 1
                            </span>
                            {step > 1 && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded">
                                    Concluído
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-typography-800 truncate">
                            Publicadores ({selectedPublishers.length})
                        </p>
                    </div>
                </button>

                {/* Stepper Connecting Bar */}
                <div
                    className={`flex-1 max-w-[140px] h-1.5 rounded-full transition-all duration-300 ${
                        step === 2 ? "bg-primary-200" : "bg-surface-300"
                    }`}
                />

                {/* Step 2 Pill */}
                <button
                    type="button"
                    onClick={() => selectedPublishers.length > 0 && setStep(2)}
                    disabled={selectedPublishers.length === 0}
                    className={`flex items-center gap-3 text-left transition-all ${
                        step === 2 ? "cursor-default" : "cursor-pointer group"
                    }`}
                >
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shrink-0 ${
                            step === 2
                                ? "bg-primary-200 text-white shadow-sm ring-4 ring-primary-200/20"
                                : "bg-surface-200 text-typography-500 border border-surface-300 group-hover:border-primary-200/50"
                        }`}
                    >
                        2
                    </div>
                    <div className="min-w-0">
                        <span
                            className={`text-[11px] font-bold uppercase tracking-wider ${
                                step === 2 ? "text-primary-200" : "text-typography-500"
                            }`}
                        >
                            Etapa 2
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-typography-800 truncate max-w-[180px]">
                            {selectedCongregationObj ? selectedCongregationObj.name : "Congregação Destino"}
                        </p>
                    </div>
                </button>
            </div>

            {/* ---------- ETAPA 1: PUBLICADORES ---------- */}
            {step === 1 && (
                <div className="space-y-6">
                    {/* Alerta Informativo */}
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-primary-200/5 border border-primary-200/20 text-typography-700">
                        <ShieldCheck className="w-5 h-5 text-primary-200 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-typography-800">
                                Transferência Segura e Integrada
                            </h4>
                            <p className="text-xs text-typography-600 leading-relaxed">
                                Os cartões de relatório (S-21), o diário pessoal e os contatos de emergência acompanharão os publicadores selecionados. Todas as escalas locais da congregação atual (limpeza, partes de reuniões, saídas de campo e carrinhos) serão desvinculadas automaticamente.
                            </p>
                        </div>
                    </div>

                    {/* Lista de Cards de Publicadores */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold text-typography-800 flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary-200" />
                                <span>Pessoas que serão transferidas ({selectedPublishers.length})</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {selectedPublishers.map((publisher) => {
                                const isInitial = publisher.id === initialPublisher.id
                                const privilegesLabels = getActivePrivilegeLabels(publisher)

                                return (
                                    <div
                                        key={publisher.id}
                                        className={`p-4 sm:p-5 rounded-2xl bg-surface-100 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                            isInitial
                                                ? "border-primary-200/40 shadow-xs ring-1 ring-primary-200/20"
                                                : "border-surface-300 shadow-2xs hover:border-surface-400"
                                        }`}
                                    >
                                        {/* Avatar e Informações */}
                                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                            {/* Avatar */}
                                            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-surface-300 flex items-center justify-center bg-primary-100/20">
                                                {publisher.gender === "Masculino" ? (
                                                    <Image
                                                        alt={publisher.fullName}
                                                        src={avatarMale}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <AvatarFemale className="w-full h-full text-primary-200 bg-primary-100/20" />
                                                )}
                                            </div>

                                            {/* Dados do Publicador */}
                                            <div className="flex flex-col min-w-0 gap-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="font-bold text-base text-typography-800 truncate">
                                                        {publisher.fullName}
                                                    </h4>
                                                    {isInitial ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-200/10 text-primary-200 border border-primary-200/30">
                            Publicador Principal
                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-200 text-typography-600 border border-surface-300">
                            Adicional
                        </span>
                                                    )}
                                                </div>

                                                {/* Badges de Privilégios */}
                                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                    {privilegesLabels.map((priv) => (
                                                        <span
                                                            key={priv}
                                                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-200/10 text-primary-200 border border-primary-200/20"
                                                        >
                            {priv}
                        </span>
                                                    ))}

                                                    {publisher.situation && (
                                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {publisher.situation}
                        </span>
                                                    )}
                                                </div>

                                                {/* Detalhes com Ícones */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-typography-500 pt-1">
                                                    {publisher.dateImmersed && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-typography-400" />
                                                            <span>
                                Batismo: {dayjs(publisher.dateImmersed).format("DD/MM/YYYY")}
                            </span>
                                                        </div>
                                                    )}
                                                    {publisher.birthDate && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-typography-400" />
                                                            <span>
                                Nascimento: {dayjs(publisher.birthDate).format("DD/MM/YYYY")}
                            </span>
                                                        </div>
                                                    )}
                                                    {publisher.group?.name && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Users className="w-3.5 h-3.5 text-typography-400" />
                                                            <span>Grupo atual: {publisher.group.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ação: Remover (somente para publicadores adicionais) */}
                                        {!isInitial && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePublisher(publisher.id)}
                                                className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 transition-colors shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Remover</span>
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Seção para Adicionar Mais Publicadores */}
                    {availablePublishers.length > 0 && (
                        <div>
                            {!dropdownOpen ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-surface-300 hover:border-primary-200/50 bg-surface-100/50 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-surface-200 text-typography-600">
                                            <UserPlus className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-typography-800">
                                                Transferir outros publicadores juntos?
                                            </h4>
                                            <p className="text-xs text-typography-500">
                                                Adicione cônjuge ou familiares que também estão se mudando para a mesma congregação.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDropdownOpen(true)}
                                        className="rounded-xl gap-2 text-xs font-semibold shrink-0 border-surface-300 hover:text-primary-200 hover:bg-surface-200"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Adicionar Publicador</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-5 rounded-2xl border border-primary-200/40 bg-surface-100 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="w-4 h-4 text-primary-200" />
                                            <h4 className="text-sm font-bold text-typography-800">
                                                Selecione o publicador adicional
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDropdownOpen(false)}
                                            className="text-xs text-typography-500 hover:text-typography-800 font-medium"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                    <DropdownObject<IPublisher>
                                        title="Buscar publicador por nome..."
                                        items={availablePublishers}
                                        selectedItem={null}
                                        handleChange={(item) => handleAddPublisher(item)}
                                        labelKey="fullName"
                                        searchable
                                        emptyMessage="Nenhum publicador adicional encontrado"
                                        full
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rodapé da Etapa 1 */}
                    <div className="flex items-center justify-between pt-4 border-t border-surface-300">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => Router.push("/congregacao/pessoas")}
                            className="rounded-xl gap-2 text-xs font-semibold text-typography-600 hover:text-typography-900"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Cancelar</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setStep(2)}
                            className="rounded-xl gap-2 font-semibold text-xs px-5 bg-primary-200 hover:bg-primary-300 text-white shadow-sm"
                        >
                            <span>Próximo: Escolher Destino</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ---------- ETAPA 2: DESTINO E FINALIZAÇÃO ---------- */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* Visual Flow Banner: Origem -> Destino */}
                    <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm">
                        {/* Origem */}
                        <div className="md:col-span-5 p-4 rounded-xl bg-surface-200/50 border border-surface-300 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-typography-500 px-2 py-0.5 rounded-md bg-surface-300/60 inline-block mb-1">
                                Origem (Atual)
                            </span>
                            <h4 className="text-base font-bold text-typography-800 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary-200" />
                                <span>{initialPublisher.congregation?.name}</span>
                            </h4>
                            <p className="text-xs text-typography-500 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-typography-400" />
                                <span>{initialPublisher.congregation?.city || "Cidade não informada"}</span>
                            </p>
                        </div>

                        {/* Seta Central */}
                        <div className="md:col-span-1 flex items-center justify-center my-1 md:my-0">
                            <div className="w-10 h-10 rounded-full bg-primary-200/10 text-primary-200 flex items-center justify-center border border-primary-200/20 shadow-2xs">
                                <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                            </div>
                        </div>

                        {/* Destino */}
                        <div
                            className={`md:col-span-5 p-4 rounded-xl border space-y-1 transition-all ${
                                selectedCongregationObj
                                    ? "bg-primary-200/5 border-primary-200/30"
                                    : "bg-surface-200/20 border-dashed border-surface-300"
                            }`}
                        >
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mb-1 ${
                                    selectedCongregationObj
                                        ? "bg-primary-200/15 text-primary-200"
                                        : "bg-surface-300/60 text-typography-500"
                                }`}
                            >
                                Destino
                            </span>
                            {selectedCongregationObj ? (
                                <>
                                    <h4 className="text-base font-bold text-typography-900 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-primary-200" />
                                        <span>{selectedCongregationObj.name}</span>
                                    </h4>
                                    <p className="text-xs text-typography-600 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-typography-400" />
                                        <span>
                                            {selectedCongregationObj.city}
                                            {selectedCongregationObj.circuit
                                                ? ` • Circuito ${selectedCongregationObj.circuit}`
                                                : ""}
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <div className="py-2 text-center text-xs text-typography-500 italic">
                                    Selecione a congregação no seletor abaixo
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Seletor de Congregação */}
                    <div className="p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-surface-300">
                            <Building2 className="w-4 h-4 text-primary-200" />
                            <h3 className="text-sm font-bold text-typography-800">
                                Escolha a Congregação de Destino
                            </h3>
                        </div>
                        <p className="text-xs text-typography-500">
                            Busque pelo nome da congregação ou pela cidade onde ela está sediada.
                        </p>

                        {loadingCongregations ? (
                            <div className="flex items-center gap-2 p-3 text-xs text-typography-500">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-200" />
                                <span>Carregando congregações disponíveis...</span>
                            </div>
                        ) : (
                            <DropdownObject<ICongregationToTransferPublisher>
                                title="Selecione a congregação..."
                                items={filterCongregations ?? []}
                                selectedItem={selectedCongregationObj ?? null}
                                handleChange={(item) => setCongregationSelected(item?.id ?? "")}
                                labelKey="name"
                                labelKeySecondary="city"
                                searchable
                                emptyMessage="Nenhuma congregação encontrada"
                                full
                            />
                        )}
                    </div>

                    {/* Resumo da Transferência e Checklist Pré-Envio */}
                    {selectedCongregationObj && (
                        <div className="p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-typography-800 pb-2 border-b border-surface-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-sm font-bold">Resumo da Transferência</h3>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-typography-600">
                                    Publicador(es) que serão transferidos para{" "}
                                    <strong className="text-typography-800">
                                        {selectedCongregationObj.name}
                                    </strong>
                                    :
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPublishers.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-200/70 border border-surface-300 text-xs font-semibold text-typography-800"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-primary-200" />
                                            <span>{p.fullName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2.5 pt-2 border-t border-surface-200 text-xs text-typography-600">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>
                                        Os cartões de publicador (S-21) e o histórico de relatórios serão migrados para a nova congregação.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>
                                        Os contatos de emergência do publicador serão transferidos para a nova congregação.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>
                                        Todas as escalas locais (limpeza, partes de reuniões, saídas de campo e carrinhos) na congregação de origem serão liberadas.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rodapé da Etapa 2 */}
                    <div className="flex items-center justify-between pt-4 border-t border-surface-300">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => setStep(1)}
                            className="rounded-xl gap-2 text-xs font-semibold border-surface-300 hover:bg-surface-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar para Publicadores</span>
                        </Button>
                        <Button
                            type="button"
                            disabled={!congregationSelected || isSubmitting}
                            onClick={handleFinish}
                            className="rounded-xl gap-2 font-semibold text-xs px-6 bg-primary-200 hover:bg-primary-300 text-white shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Transferindo...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Finalizar Transferência</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
