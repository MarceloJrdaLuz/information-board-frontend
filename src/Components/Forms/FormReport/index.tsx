import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import { API_ROUTES } from "@/constants/apiRoutes"
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
    Clock,
    FileText,
    MessageSquare,
    Send,
    User
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
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

    const [month, setMonth] = useState("")
    const [year, setYear] = useState("")
    const [optionsDrop, setOptionsDrop] = useState<IPublisherList[]>([])
    const [publisherToSend, setPublisherToSend] = useState<IPublisherList>()
    const [underAnHour, setUnderAnHour] = useState(false)
    const [consentAcceptedShow, setConsentAcceptedShow] = useState(false)
    const [submittedData, setSubmittedData] = useState<FormValues>()
    const [deviceId, setDeviceId] = useState<string | undefined>()

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

    const handleClick = (option: IPublisherList | undefined) => {
        setPublisherToSend(option)
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
                const payload: IPayloadCreateReport = {
                    publisher_id: publisherToSend?.id ?? "",
                    hours: underAnHour ? 0 : hours ?? 0,
                    month,
                    observations,
                    studies: Number(studies) || 0,
                    year
                }

                toast
                    .promise(createReport(payload), {
                        pending: "Enviando relatório...",
                        success: "Relatório enviado com sucesso! 🎉",
                        error: "Erro ao enviar relatório."
                    })
                    .then(() => {
                        resetField("hours")
                        resetField("studies")
                        resetField("observations")
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
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-typography-700 flex items-center gap-1.5">
                        <User size={14} className="text-primary-200" />
                        <span>Publicador(a) *</span>
                    </label>
                    <div className="w-full">
                        <DropdownSearch
                            emptyMessage="Nenhum publicador encontrado"
                            full
                            border
                            title="Selecione seu nome..."
                            handleClick={handleClick}
                            options={optionsDrop}
                        />
                    </div>
                </div>

                {/* Opção: Participou (Menos de 1 hora) */}
                <div className="bg-surface-200/60 border border-surface-300/80 rounded-xl p-3.5 flex items-start gap-3 transition-colors hover:bg-surface-200">
                    <input
                        type="checkbox"
                        id="underAnHour"
                        checked={underAnHour}
                        onChange={(e) => {
                            setUnderAnHour(e.target.checked)
                            clearErrors("hours")
                        }}
                        className="mt-0.5 w-4 h-4 rounded text-primary-200 border-typography-300 focus:ring-primary-200 cursor-pointer"
                    />
                    <label
                        htmlFor="underAnHour"
                        className="text-xs sm:text-sm text-typography-700 cursor-pointer leading-snug select-none"
                    >
                        <strong className="block text-typography-800 font-semibold mb-0.5">
                            Sou publicador, participei na pregação
                        </strong>
                        Marque aqui caso tenha participado no ministério mas não tenha completado horas inteiras.
                    </label>
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
                        placeholder="Ex: Pioneiro auxiliar neste mês..."
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