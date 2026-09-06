import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Dropdown from "@/Components/Dropdown"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { obterUltimosMeses } from "@/functions/meses"
import { useFetch } from "@/hooks/useFetch"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { IMeetingAssistance } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Info,
    Save,
    TrendingUp,
    Users
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { FormValues } from "./types"

interface IFormAssistanceProps {
    congregation_id: string
}

const esquemaValidacao = yup.object({
    midWeek1: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    midWeek2: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    midWeek3: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    midWeek4: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    midWeek5: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    endWeek1: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    endWeek2: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    endWeek3: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    endWeek4: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
    endWeek5: yup.number().transform((originalValue) => (isNaN(originalValue) ? 0 : originalValue)),
})

export default function FormAssistance({ congregation_id }: IFormAssistanceProps) {
    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const [monthWithYear, setMonthWithYear] = useState('')
    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')
    const [alreadyExists, setAlreadyExists] = useState<IMeetingAssistance[]>()
    const [optionsDropdown] = useState<string[]>([...obterUltimosMeses().anoCorrente, ...obterUltimosMeses().anoAnterior])
    const { data } = useFetch<IMeetingAssistance[]>(congregation_id ? `/assistance/${congregation_id}` : '')
    const [midWeekTotal, setMidWeekTotal] = useState(0)
    const [midWeekAverage, setMidWeekAverage] = useState(0)
    const [endWeekAverage, setEndWeekAverage] = useState(0)
    const [endWeekTotal, setEndWeekTotal] = useState(0)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        if (monthWithYear) {
            let dividirPalavra = monthWithYear.split(" ")
            setMonthSelected(dividirPalavra[0])
            setYearSelected(dividirPalavra[1])
        }
    }, [monthWithYear])

    useEffect(() => {
        if (optionsDropdown && optionsDropdown.length > 0) {
            setMonthWithYear(optionsDropdown[0])
        }
    }, [optionsDropdown])

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
        defaultValues: {
            midWeek1: 0,
            midWeek2: 0,
            midWeek3: 0,
            midWeek4: 0,
            midWeek5: 0,
            endWeek1: 0,
            endWeek2: 0,
            endWeek3: 0,
            endWeek4: 0,
            endWeek5: 0,
        },
        resolver: yupResolver(esquemaValidacao) as any
    })

    useEffect(() => {
        if (data && monthSelected && yearSelected) {
            const filter = data.filter(
                meetingAssistance => meetingAssistance.month === capitalizeFirstLetter(monthSelected) && meetingAssistance.year === yearSelected
            )
            if (filter.length > 0) {
                setAlreadyExists(filter)
                const existingData = filter[0]
                setValue('midWeek1', Number(existingData.midWeek[0]) || 0)
                setValue('midWeek2', Number(existingData.midWeek[1]) || 0)
                setValue('midWeek3', Number(existingData.midWeek[2]) || 0)
                setValue('midWeek4', Number(existingData.midWeek[3]) || 0)
                setValue('midWeek5', Number(existingData.midWeek[4]) || 0)
                setValue('endWeek1', Number(existingData.endWeek[0]) || 0)
                setValue('endWeek2', Number(existingData.endWeek[1]) || 0)
                setValue('endWeek3', Number(existingData.endWeek[2]) || 0)
                setValue('endWeek4', Number(existingData.endWeek[3]) || 0)
                setValue('endWeek5', Number(existingData.endWeek[4]) || 0)
            } else {
                setAlreadyExists(undefined)
                setValue('midWeek1', 0)
                setValue('midWeek2', 0)
                setValue('midWeek3', 0)
                setValue('midWeek4', 0)
                setValue('midWeek5', 0)
                setValue('endWeek1', 0)
                setValue('endWeek2', 0)
                setValue('endWeek3', 0)
                setValue('endWeek4', 0)
                setValue('endWeek5', 0)
            }
        }
    }, [data, monthSelected, yearSelected, setValue])

    const watchedFieldsMidWeeks = watch(["midWeek1", "midWeek2", "midWeek3", "midWeek4", "midWeek5"]) as (number | undefined)[]
    const watchedFieldsEndWeeks = watch(["endWeek1", "endWeek2", "endWeek3", "endWeek4", "endWeek5"]) as (number | undefined)[]

    useEffect(() => {
        const midValues = watchedFieldsMidWeeks || []
        const totalMid = midValues.reduce((total: number, value) => total + (Number(value) || 0), 0)
        const nonZeroMid = midValues.filter(value => Number(value) > 0).length
        setMidWeekTotal(totalMid)
        setMidWeekAverage(nonZeroMid > 0 ? Math.round(totalMid / nonZeroMid) : 0)

        const endValues = watchedFieldsEndWeeks || []
        const totalEnd = endValues.reduce((total: number, value) => total + (Number(value) || 0), 0)
        const nonZeroEnd = endValues.filter(value => Number(value) > 0).length
        setEndWeekTotal(totalEnd)
        setEndWeekAverage(nonZeroEnd > 0 ? Math.round(totalEnd / nonZeroEnd) : 0)
    }, [watchedFieldsMidWeeks, watchedFieldsEndWeeks])

    const sendAssistence = async (formData: {
        month: string,
        year: string,
        endWeek: (number | undefined)[],
        midWeek: (number | undefined)[]
    }) => {
        const endWeeksAsString = formData.endWeek.map(v => String(Number(v) || 0))
        const midWeeksAsString = formData.midWeek.map(v => String(Number(v) || 0))

        const payload = {
            month: capitalizeFirstLetter(formData.month),
            year: formData.year,
            midWeek: midWeeksAsString,
            midWeekTotal,
            midWeekAverage,
            endWeek: endWeeksAsString,
            endWeekTotal,
            endWeekAverage,
        }

        return api.post(`/assistance/${congregation_id}`, payload)
            .then(() => {
                handleSubmitSuccess(messageSuccessSubmit.assistanceCreate, `/congregacao/assistencia/${congregation_id}`)
            })
            .catch(err => {
                console.error(err)
                handleSubmitError(messageErrorsSubmit.default)
                throw err
            })
    }

    function onSubmit(formValues: FormValues) {
        toast.promise(
            sendAssistence({
                month: monthSelected,
                year: yearSelected,
                midWeek: watchedFieldsMidWeeks,
                endWeek: watchedFieldsEndWeeks
            }),
            {
                pending: 'Enviando assistência...',
                success: 'Assistência registrada com sucesso!',
                error: 'Erro ao registrar assistência. Verifique os dados.'
            }
        )
    }

    const handleClick = (selected: string) => {
        setMonthWithYear(selected)
    }

    function onError(formErrors: any) {
        console.error(formErrors)
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    const midWeekFields: { key: keyof FormValues; label: string; optional?: boolean }[] = [
        { key: "midWeek1", label: "1ª Semana" },
        { key: "midWeek2", label: "2ª Semana" },
        { key: "midWeek3", label: "3ª Semana" },
        { key: "midWeek4", label: "4ª Semana" },
        { key: "midWeek5", label: "5ª Semana", optional: true },
    ]

    const endWeekFields: { key: keyof FormValues; label: string; optional?: boolean }[] = [
        { key: "endWeek1", label: "1ª Semana" },
        { key: "endWeek2", label: "2ª Semana" },
        { key: "endWeek3", label: "3ª Semana" },
        { key: "endWeek4", label: "4ª Semana" },
        { key: "endWeek5", label: "5ª Semana", optional: true },
    ]

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 pb-28 md:pb-36 flex flex-col gap-6">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
                {/* Header Card */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-100/15 border border-primary-200/25 text-primary-200 flex items-center justify-center shrink-0 shadow-xs">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-typography-900 tracking-tight">
                                    Lançar Assistência
                                </h1>
                                <p className="text-xs md:text-sm text-typography-500 mt-0.5">
                                    Registre a assistência semanal das reuniões da congregação.
                                </p>
                            </div>
                        </div>

                        {/* Month Selector */}
                        <div className="flex flex-col sm:min-w-[240px]">
                            <span className="text-xs font-semibold text-typography-600 mb-1.5 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary-200" />
                                <span>Mês de Referência</span>
                            </span>
                            <Dropdown
                                textVisible
                                full
                                border
                                selectedItem={monthWithYear}
                                handleClick={handleClick}
                                options={optionsDropdown}
                                title="Selecione o mês"
                            />
                        </div>
                    </div>

                    {/* Notification if records already exist */}
                    {alreadyExists && alreadyExists.length > 0 && (
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                            <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                            <div>
                                <p className="font-semibold">Registros existentes carregados para este mês</p>
                                <p className="text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                                    Já consta assistência salva para <span className="underline font-medium">{monthWithYear}</span>. Você pode editar os valores e salvar novamente para atualizar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Meetings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Meio de Semana Card */}
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col justify-between gap-6">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-surface-300/80">
                                <div className="w-10 h-10 rounded-xl bg-primary-100/15 text-primary-200 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-typography-900">
                                        Reunião do Meio de Semana
                                    </h2>
                                    <p className="text-xs text-typography-500">
                                        Nossa Vida e Ministério Cristão
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3.5">
                                {midWeekFields.map(({ key, label, optional }) => (
                                    <div key={key} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-typography-700 flex items-center justify-between">
                                            <span>{label}</span>
                                            {optional && (
                                                <span className="text-[11px] font-normal text-typography-400">
                                                    (se houver 5ª semana)
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative flex items-center">
                                            <Users className="w-4 h-4 text-typography-400 absolute left-3.5 pointer-events-none" />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                                {...register(key)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-surface-200/40 focus:bg-surface-100 border border-surface-300 focus:border-primary-200 rounded-xl text-typography-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-200/20 transition-all placeholder:text-typography-400/50"
                                            />
                                        </div>
                                        {errors[key]?.message && (
                                            <span className="text-xs text-red-500">
                                                {String(errors[key]?.message)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Summary Stats */}
                        <div className="bg-surface-200/60 border border-surface-300 rounded-xl p-4 grid grid-cols-2 gap-4 divide-x divide-surface-300/80">
                            <div>
                                <span className="text-xs font-medium text-typography-500 block">Total Geral</span>
                                <span className="text-2xl font-bold text-typography-900 tracking-tight mt-0.5 block">
                                    {midWeekTotal}
                                </span>
                            </div>
                            <div className="pl-4">
                                <span className="text-xs font-medium text-typography-500 block">Média por Reunião</span>
                                <span className="text-2xl font-bold text-primary-200 tracking-tight mt-0.5 block">
                                    {midWeekAverage}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fim de Semana Card */}
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col justify-between gap-6">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3 pb-4 border-b border-surface-300/80">
                                <div className="w-10 h-10 rounded-xl bg-primary-100/15 text-primary-200 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-typography-900">
                                        Reunião do Fim de Semana
                                    </h2>
                                    <p className="text-xs text-typography-500">
                                        Discurso Público e Estudo de A Sentinela
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3.5">
                                {endWeekFields.map(({ key, label, optional }) => (
                                    <div key={key} className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-typography-700 flex items-center justify-between">
                                            <span>{label}</span>
                                            {optional && (
                                                <span className="text-[11px] font-normal text-typography-400">
                                                    (se houver 5ª semana)
                                                </span>
                                            )}
                                        </label>
                                        <div className="relative flex items-center">
                                            <Users className="w-4 h-4 text-typography-400 absolute left-3.5 pointer-events-none" />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                onWheel={(e) => (e.target as HTMLElement).blur()}
                                                {...register(key)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-surface-200/40 focus:bg-surface-100 border border-surface-300 focus:border-primary-200 rounded-xl text-typography-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary-200/20 transition-all placeholder:text-typography-400/50"
                                            />
                                        </div>
                                        {errors[key]?.message && (
                                            <span className="text-xs text-red-500">
                                                {String(errors[key]?.message)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Live Summary Stats */}
                        <div className="bg-surface-200/60 border border-surface-300 rounded-xl p-4 grid grid-cols-2 gap-4 divide-x divide-surface-300/80">
                            <div>
                                <span className="text-xs font-medium text-typography-500 block">Total Geral</span>
                                <span className="text-2xl font-bold text-typography-900 tracking-tight mt-0.5 block">
                                    {endWeekTotal}
                                </span>
                            </div>
                            <div className="pl-4">
                                <span className="text-xs font-medium text-typography-500 block">Média por Reunião</span>
                                <span className="text-2xl font-bold text-primary-200 tracking-tight mt-0.5 block">
                                    {endWeekAverage}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                    <Link
                        href={`/congregacao/assistencia/${congregation_id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-typography-600 hover:text-typography-900 bg-surface-200 hover:bg-surface-300 border border-surface-300 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar para Lista</span>
                    </Link>

                    <button
                        type="submit"
                        disabled={disabled}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-200 hover:bg-primary-200/90 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        <span>Salvar Assistência</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
