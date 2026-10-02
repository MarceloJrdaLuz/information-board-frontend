import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useAuthContext } from "@/context/AuthContext"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { useFetch } from "@/hooks/useFetch"
import { usePublisher } from "@/hooks/usePublisher"
import { api } from "@/services/api"
import { ICheckPublisherConsent } from "@/types/consent"
import { IPayloadCreateReport } from "@/types/reports"
import { IPublisherList } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { useAtomValue } from "jotai"
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Check,
    Clock,
    FileText,
    MessageSquare,
    Send,
    User,
    Users
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"
import ConsentMessage from "../../ConsentMessage"
import DropdownSearch from "../../DropdownSearch"
import { FormValues } from "./types"

dayjs.locale("pt-br")

interface IRelatorioFormProps {
    congregationNumber: string
}

export default function FormReport(props: IRelatorioFormProps) {
    const { data } = useFetch<IPublisherList[]>(
        `${API_ROUTES.PUBLISHERS}/congregationNumber/${props.congregationNumber}`
    )
    const { createReport, createConsentRecord } = usePublisher()
    const { user, authResolved } = useAuthContext()

    const [month, setMonth] = useState("")
    const [year, setYear] = useState("")
    const [optionsDrop, setOptionsDrop] = useState<IPublisherList[]>([])
    const [publisherToSend, setPublisherToSend] = useState<IPublisherList>()
    const [underAnHour, setUnderAnHour] = useState(false)
    const [consentAcceptedShow, setConsentAcceptedShow] = useState(false)
    const [submittedData, setSubmittedData] = useState<FormValues>()
    const [deviceId, setDeviceId] = useState<string | undefined>()

    // Publicadores salvos neste dispositivo
    const [savedPublishers, setSavedPublishers] = useState<IPublisherList[]>([])
    // IDs dos publicadores que já enviaram relatório neste dispositivo no mês/ano selecionado
    const [submittedIds, setSubmittedIds] = useState<string[]>([])

    const autoSelectedRef = useRef(false)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        if (data) {
            setOptionsDrop(data)
        }
    }, [data])

    useEffect(() => {
        const today = dayjs().locale("pt-br")
        const isFirstHalfOfMonth = today.date() >= 1 && today.date() <= 25

        const newDate = isFirstHalfOfMonth ? today.subtract(1, "month") : today
        setMonth(capitalizeFirstLetter(newDate.format("MMMM")))
        setYear(newDate.format("YYYY"))
    }, [])

    const getStorageSubmittedKey = (m: string, y: string) => {
        return `submitted_reports_${props.congregationNumber}_${m}_${y}`
    }

    // Carrega deviceId existente do localStorage
    useEffect(() => {
        const storedDeviceId = localStorage.getItem("deviceId")
        if (storedDeviceId) {
            setDeviceId(storedDeviceId)
        }
    }, [])

    // Carrega histórico de envios do mês atual neste dispositivo
    useEffect(() => {
        if (!month || !year) return
        try {
            const key = getStorageSubmittedKey(month, year)
            const stored = localStorage.getItem(key)
            if (stored) {
                setSubmittedIds(JSON.parse(stored))
            } else {
                setSubmittedIds([])
            }
        } catch {
            setSubmittedIds([])
        }
    }, [month, year, props.congregationNumber])

    const savePublisherToDevice = (pub: IPublisherList) => {
        try {
            const storage = localStorage.getItem("publisher")
            const parsed: any[] = storage ? JSON.parse(storage) : []
            const existing = parsed.find((p) => p?.id === pub.id)
            const filtered = parsed.filter((p) => p?.id && p.id !== pub.id)
            const updated = [
                ...filtered,
                {
                    ...existing,
                    id: pub.id,
                    fullName: pub.fullName,
                    nickname: pub.nickname,
                    congregation_id: pub.congregation_id,
                    congregation_number: pub.congregation_number
                }
            ]
            localStorage.setItem("publisher", JSON.stringify(updated))

            setSavedPublishers((prev) => {
                if (prev.some((p) => p.id === pub.id)) return prev
                return [...prev, pub]
            })
        } catch (e) {
            console.error(e)
        }
    }

    const markAsSubmitted = (publisherId: string) => {
        setSubmittedIds((prev) => {
            if (prev.includes(publisherId)) return prev
            const updated = [...prev, publisherId]
            if (month && year) {
                try {
                    localStorage.setItem(getStorageSubmittedKey(month, year), JSON.stringify(updated))
                } catch (e) {
                    console.error(e)
                }
            }
            return updated
        })
    }

    // Carrega publicadores salvos no dispositivo a partir do storage e usuário logado
    useEffect(() => {
        if (!optionsDrop || optionsDrop.length === 0) return

        try {
            const storage = localStorage.getItem("publisher")
            const parsed: any[] = storage ? JSON.parse(storage) : []
            const validIds = parsed.map((p) => p?.id).filter(Boolean)

            if (user?.publisher?.id && !validIds.includes(user.publisher.id)) {
                validIds.push(user.publisher.id)
            }

            const matched = optionsDrop.filter((p) => validIds.includes(p.id))
            setSavedPublishers(matched)
        } catch {
            setSavedPublishers([])
        }
    }, [optionsDrop, user])

    // Pré-seleção inteligente do publicador
    useEffect(() => {
        if (!authResolved || optionsDrop.length === 0 || autoSelectedRef.current) return

        let chosen: IPublisherList | undefined

        // 1. Se estiver logado na aplicação
        if (user?.publisher?.id) {
            const loggedInPub = optionsDrop.find((p) => p.id === user.publisher?.id)
            if (loggedInPub) {
                savePublisherToDevice(loggedInPub)

                const isAlreadySubmitted = submittedIds.includes(loggedInPub.id)
                if (isAlreadySubmitted && savedPublishers.length > 0) {
                    const unsubmitted = savedPublishers.find((p) => !submittedIds.includes(p.id))
                    chosen = unsubmitted || loggedInPub
                } else {
                    chosen = loggedInPub
                }
            }
        }

        // 2. Se não estiver logado ou o publicador logado não for desta congregação
        if (!chosen) {
            const storage = localStorage.getItem("publisher")
            const parsed: any[] = storage ? JSON.parse(storage) : []
            const validIds = parsed.map((p) => p?.id).filter(Boolean)
            const matched = optionsDrop.filter((p) => validIds.includes(p.id))

            if (matched.length > 0) {
                const unsubmitted = matched.find((p) => !submittedIds.includes(p.id))
                if (unsubmitted) {
                    chosen = unsubmitted
                } else {
                    const lastId = localStorage.getItem("lastSelectedPublisherId")
                    const lastPub = matched.find((p) => p.id === lastId)
                    chosen = lastPub || matched[0]
                }
            }
        }

        if (chosen) {
            setPublisherToSend(chosen)
            autoSelectedRef.current = true
        }
    }, [authResolved, optionsDrop, user, submittedIds, savedPublishers])

    const handleClick = (option: IPublisherList | undefined) => {
        setPublisherToSend(option)
        if (option?.id) {
            localStorage.setItem("lastSelectedPublisherId", option.id)
        }
    }

    const validationSchema = yup.object({
        month: yup.string().required(),
        hours: yup.number().transform((value) => (isNaN(value) ? 0 : value)),
        studies: yup
            .number()
            .transform((value) => (isNaN(value) ? 0 : value))
            .nullable(),
        observations: yup.string()
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        setError,
        clearErrors,
        resetField
    } = useForm({
        defaultValues: {
            month: "",
            hours: 0,
            studies: "",
            observations: ""
        },
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        setValue("month", month)
    }, [month, setValue])

    const handleConsentRecordsCreate = async () => {
        setConsentAcceptedShow(false)

        if (!publisherToSend) return

        let deviceIdToUse = deviceId

        if (!deviceIdToUse) {
            deviceIdToUse = crypto.randomUUID()
            setDeviceId(deviceIdToUse)
            localStorage.setItem("deviceId", deviceIdToUse)
        }

        await createConsentRecord(publisherToSend.id, deviceIdToUse)

        savePublisherToDevice(publisherToSend)

        if (submittedData) {
            sendSubmit(submittedData)
        }
    }

    function sendSubmit({ hours, month, observations, studies }: FormValues) {
        if (publisherToSend !== undefined) {
            if (hours !== null && hours <= 0 && !underAnHour) {
                setError("hours", {
                    type: "min",
                    message: "Informe as horas ou marque a opção de participação"
                })
            } else {
                const currentPub = publisherToSend
                const payload: IPayloadCreateReport = {
                    publisher_id: currentPub.id,
                    hours: underAnHour ? 0 : hours ?? 0,
                    month,
                    observations,
                    studies: Number(studies) || 0,
                    year
                }

                toast
                    .promise(createReport(payload), {
                        pending: "Enviando relatório...",
                        error: "Erro ao enviar relatório."
                    })
                    .then(() => {
                        resetField("hours")
                        resetField("studies")
                        resetField("observations")
                        setUnderAnHour(false)

                        markAsSubmitted(currentPub.id)
                        savePublisherToDevice(currentPub)

                        // Procura o próximo publicador salvo no histórico deste dispositivo que ainda não enviou
                        const storage = localStorage.getItem("publisher")
                        const parsed: any[] = storage ? JSON.parse(storage) : []
                        const validIds = parsed.map((p) => p?.id).filter(Boolean)
                        const devicePublishers = optionsDrop.filter((p) => validIds.includes(p.id))

                        const currentSubmitted = [...submittedIds, currentPub.id]
                        const unsubmittedList = devicePublishers.filter(
                            (p) => !currentSubmitted.includes(p.id)
                        )

                        if (unsubmittedList.length > 0) {
                            const nextPub = unsubmittedList[0]
                            setPublisherToSend(nextPub)
                            localStorage.setItem("lastSelectedPublisherId", nextPub.id)
                            toast.info(
                                `Relatório de ${currentPub.fullName} enviado! Agora selecionamos ${nextPub.fullName} para o próximo envio.`,
                                { autoClose: 6000 }
                            )
                        } else if (devicePublishers.length > 1) {
                            toast.success(
                                `Relatório de ${currentPub.fullName} enviado! Todos os relatórios salvos neste dispositivo foram preenchidos para este mês. 🎉`
                            )
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        } else {
            toast.error("Publicador não selecionado!")
        }
    }

    async function onSubmit(data: FormValues) {
        setSubmittedData(data)

        if (!publisherToSend?.id) {
            toast.error("Por favor, selecione seu nome!")
            return
        }

        const publisherStorage = localStorage.getItem("publisher")
        const parsedStorage: IPublisherList[] = publisherStorage
            ? JSON.parse(publisherStorage)
            : []

        const consentRecord = parsedStorage.find(
            (record) => record?.id === publisherToSend.id && record?.deviceId
        )

        if (consentRecord) {
            try {
                const response = await api.get<ICheckPublisherConsent>(
                    `/consent/check?publisher_id=${consentRecord.id}&type=publisher`
                )

                if (
                    response.status === 200 &&
                    response.data.hasAccepted &&
                    response.data.isLatestVersion
                ) {
                    sendSubmit(data)
                    return
                }

                setConsentAcceptedShow(true)
            } catch (error) {
                console.log(error)
                setConsentAcceptedShow(true)
            }

            return
        }

        setConsentAcceptedShow(true)
    }

    function onError() {
        toast.error("Confira todos os campos antes de enviar!")
    }

    return (
        <div className="w-full flex justify-center">
            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="w-full max-w-lg bg-surface-100 border border-surface-300 rounded-2xl p-5 sm:p-7 shadow-sm flex flex-col gap-5"
            >
                {/* Header do Card de Relatório com Mês em Destaque */}
                <div className="flex flex-col gap-2 border-b border-surface-300/60 pb-4">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1.5">
                            <FileText size={15} />
                            <span>Envio de Atividade</span>
                        </span>

                        {month && year && (
                            <span className="bg-primary-200/10 text-primary-200 text-xs font-bold px-3 py-1 rounded-full border border-primary-200/20 flex items-center gap-1">
                                <Calendar size={13} />
                                <span>
                                    {month}/{year}
                                </span>
                            </span>
                        )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-typography-800 tracking-tight">
                        Relatório Mensal de Campo
                    </h2>
                    <p className="text-xs text-typography-500">
                        Preencha seus dados de atividade para a congregação
                    </p>
                </div>

                {/* Seleção de Publicador */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-typography-700 flex items-center gap-1.5">
                            <User size={14} className="text-primary-200" />
                            <span>Publicador(a) *</span>
                        </label>
                        {savedPublishers.length > 0 && (
                            <span className="text-[11px] text-typography-400">
                                {savedPublishers.length}{" "}
                                {savedPublishers.length === 1
                                    ? "salvo no dispositivo"
                                    : "salvos no dispositivo"}
                            </span>
                        )}
                    </div>

                    {/* Quick-switch chips para publicadores salvos no dispositivo */}
                    {savedPublishers.length > 0 && (
                        <div className="flex flex-col gap-1.5 bg-surface-200/50 p-2.5 rounded-xl border border-surface-300/70">
                            <span className="text-[11px] font-medium text-typography-500 flex items-center gap-1">
                                <Users size={12} className="text-typography-400" />
                                <span>Salvos neste dispositivo:</span>
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {savedPublishers.map((pub) => {
                                    const isSelected = publisherToSend?.id === pub.id
                                    const isSubmitted = submittedIds.includes(pub.id)
                                    return (
                                        <button
                                            key={pub.id}
                                            type="button"
                                            onClick={() => handleClick(pub)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none ${
                                                isSelected
                                                    ? "bg-primary-200 text-white shadow-sm ring-2 ring-primary-200/30 font-bold"
                                                    : "bg-surface-100 text-typography-700 hover:bg-surface-200/80 border border-surface-300 font-medium"
                                            }`}
                                        >
                                            <span className="truncate max-w-[140px] sm:max-w-[180px]">
                                                {pub.fullName}
                                            </span>
                                            {isSubmitted ? (
                                                <span
                                                    title="Relatório enviado este mês"
                                                    className={`inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded font-bold ${
                                                        isSelected
                                                            ? "bg-white/20 text-white"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                                    }`}
                                                >
                                                    <Check size={11} className="stroke-[3]" />
                                                    <span>Enviado</span>
                                                </span>
                                            ) : (
                                                <span
                                                    title="Pendente de envio"
                                                    className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                        isSelected
                                                            ? "bg-white/20 text-white"
                                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                                    }`}
                                                >
                                                    Pendente
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="w-full">
                        <DropdownSearch
                            emptyMessage="Nenhum publicador encontrado"
                            full
                            border
                            title="Selecione seu nome..."
                            handleClick={handleClick}
                            options={optionsDrop}
                            value={publisherToSend}
                        />
                    </div>
                </div>

                {/* Opção: Participou (Menos de 1 hora) */}
                <div
                    onClick={() => {
                        setUnderAnHour(!underAnHour)
                        clearErrors("hours")
                    }}
                    className={`border rounded-xl p-3.5 flex items-start gap-3 transition-all cursor-pointer select-none ${
                        underAnHour
                            ? "bg-primary-200/10 border-primary-200 shadow-sm"
                            : "bg-surface-200/60 border-surface-300/80 hover:bg-surface-200"
                    }`}
                >
                    {/* Checkbox customizado na cor primary-200 */}
                    <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            underAnHour
                                ? "bg-primary-200 text-white shadow-sm"
                                : "border-2 border-typography-400/60 bg-surface-100"
                        }`}
                    >
                        {underAnHour && <Check size={13} className="stroke-[3]" />}
                    </div>

                    <div className="text-xs sm:text-sm text-typography-700 leading-snug">
                        <strong className="block text-typography-800 font-semibold mb-0.5">
                            Sou publicador, participei na pregação
                        </strong>
                        Marque aqui caso tenha participado no ministério mas não tenha completado horas inteiras.
                    </div>
                </div>

                {/* Campo de Horas */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-typography-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary-200" />
                            <span>Horas {underAnHour ? "(Dispensado)" : "*"}</span>
                        </span>
                        {!underAnHour && (
                            <span className="text-[11px] text-typography-400">
                                Apenas números inteiros
                            </span>
                        )}
                    </label>

                    <div className="relative">
                        <input
                            type={underAnHour ? "text" : "number"}
                            disabled={underAnHour}
                            placeholder={underAnHour ? "Participou na pregação" : "Ex: 10"}
                            {...register("hours", {
                                required: !underAnHour ? "Informe as horas" : false
                            })}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-surface-100 text-typography-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 transition ${
                                errors?.hours
                                    ? "border-red-500 focus:ring-red-400"
                                    : "border-surface-300 focus:border-primary-200"
                            } ${underAnHour ? "opacity-60 bg-surface-200/50 cursor-not-allowed" : ""}`}
                        />
                    </div>
                    {errors?.hours && (
                        <span className="text-xs text-red-500 font-medium">
                            Por favor, informe a quantidade de horas.
                        </span>
                    )}
                </div>

                {/* Campo de Estudos Bíblicos */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-typography-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <BookOpen size={14} className="text-primary-200" />
                            <span>Estudos Bíblicos Dirigidos</span>
                        </span>
                        <span className="text-[11px] text-typography-400">Opcional</span>
                    </label>

                    <input
                        type="number"
                        placeholder="Ex: 1"
                        {...register("studies")}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-300 bg-surface-100 text-typography-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition"
                    />
                </div>

                {/* Campo de Observações */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-typography-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-primary-200" />
                            <span>Observações</span>
                        </span>
                        <span className="text-[11px] text-typography-400">Máx. 50 caracteres</span>
                    </label>

                    <input
                        type="text"
                        maxLength={50}
                        placeholder="Ex: Crédito de horas..."
                        {...register("observations")}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-300 bg-surface-100 text-typography-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-200 transition"
                    />
                </div>

                {/* Botão de Submissão */}
                <button
                    type="submit"
                    disabled={disabled || isSubmitting}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                    <span>{isSubmitting ? "Enviando..." : "Enviar Relatório"}</span>
                </button>

                {/* Link para Meus Relatórios */}
                <div className="text-center pt-1 border-t border-surface-300/40">
                    <Link
                        href="/meus-relatorios"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-200 hover:underline hover:opacity-90 transition py-1"
                    >
                        <span>Acessar Meus Relatórios</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </form>

            {/* Modal de Termo de Consentimento LGPD */}
            {consentAcceptedShow && (
                <ConsentMessage
                    text="Essa é a primeira vez que você manda seu relatório nesse dispositivo, é necessário aceitar o termo de consentimento!"
                    name={publisherToSend?.fullName}
                    onAccepted={handleConsentRecordsCreate}
                    onDecline={() => setConsentAcceptedShow(false)}
                    congregatioNumber={props.congregationNumber}
                />
            )}
        </div>
    )
}