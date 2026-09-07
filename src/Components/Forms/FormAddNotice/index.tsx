import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import ModalHelp from "@/Components/ModalHelp"
import { useCongregationContext } from "@/context/CongregationContext"
import { useNotices } from "@/hooks/useNotices"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import {
    AlertCircle,
    Bell,
    Calendar as CalendarLucide,
    Check,
    Clock,
    Copy,
    Eye,
    HelpCircle,
    Info,
    Repeat,
    Sparkles
} from "lucide-react"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"
import { FormValues, IFormNoticeProps } from "./types"

export default function FormAddNotice({ congregationNumber }: IFormNoticeProps) {
    const router = useRouter()
    const { congregation } = useCongregationContext()
    const { createNotice, setExpiredNotice } = useNotices(congregationNumber)

    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [recurrentNotice, setRecurrentNotice] = useState(false)
    const [modalHelpShow, setModalHelpShow] = useState(false)
    const [previewCopied, setPreviewCopied] = useState(false)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const validationSchema = yup.object({
        title: yup
            .string()
            .trim()
            .required("O título do anúncio é obrigatório")
            .min(3, "O título deve ter pelo menos 3 caracteres"),
        text: yup
            .string()
            .trim()
            .required("O conteúdo do anúncio é obrigatório")
            .min(5, "O conteúdo deve ter pelo menos 5 caracteres"),
        startDay: yup.number().nullable().transform((v, o) => (o === "" ? null : v)),
        endDay: yup.number().nullable().transform((v, o) => (o === "" ? null : v)),
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch,
    } = useForm<FormValues>({
        defaultValues: {
            title: "",
            text: "",
            startDay: undefined,
            endDay: undefined,
        },
        resolver: yupResolver(validationSchema) as any,
    })

    const watchedTitle = watch("title") || ""
    const watchedText = watch("text") || ""
    const watchedStartDay = watch("startDay")
    const watchedEndDay = watch("endDay")

    const isRecurrentRangeInvalid =
        recurrentNotice &&
        watchedStartDay !== undefined &&
        watchedEndDay !== undefined &&
        Number(watchedStartDay) > Number(watchedEndDay)

    const handleRecurrentNoticeChange = (isChecked: boolean) => {
        setRecurrentNotice(isChecked)
        if (!isChecked) {
            setValue("startDay", undefined)
            setValue("endDay", undefined)
        }
    }

    const handleDateChange = (date: string | null) => {
        setExpiredNotice(date)
        setSelectedDate(date)
    }

    const setQuickDatePreset = (daysOffset: number | null) => {
        if (daysOffset === null) {
            handleDateChange(null)
        } else if (daysOffset === 0) {
            // Fim do mês atual
            const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD")
            handleDateChange(endOfMonth)
        } else {
            const nextDate = dayjs().add(daysOffset, "day").format("YYYY-MM-DD")
            handleDateChange(nextDate)
        }
    }

    const onSubmit = async ({ title, text, startDay, endDay }: FormValues) => {
        if (isRecurrentRangeInvalid) {
            toast.error("O dia inicial não pode ser maior do que o dia final.")
            return
        }

        try {
            await toast.promise(
                createNotice(
                    title.trim(),
                    text.trim(),
                    recurrentNotice && startDay ? Number(startDay) : undefined,
                    recurrentNotice && endDay ? Number(endDay) : undefined
                ),
                {
                    pending: "Publicando novo anúncio...",
                    success: "Anúncio publicado com sucesso!",
                    error: "Erro ao publicar anúncio. Verifique os campos.",
                }
            )

            reset()
            setRecurrentNotice(false)
            setSelectedDate(null)
            router.push("/congregacao/anuncios")
        } catch (err) {
            console.error("Erro ao criar anúncio:", err)
        }
    }

    const onError = () => {
        toast.error("Aconteceu algum erro! Confira todos os campos obrigatórios.")
    }

    const handleSimulateCopy = () => {
        if (!watchedTitle && !watchedText) return
        const textToCopy = `📢 *${watchedTitle || "Anúncio"}*\n\n${watchedText}`
        navigator.clipboard.writeText(textToCopy)
        setPreviewCopied(true)
        setTimeout(() => setPreviewCopied(false), 2500)
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {modalHelpShow && (
                <ModalHelp
                    open={modalHelpShow}
                    setOpen={setModalHelpShow}
                    title="Como criar e programar um anúncio"
                    text={`
1. Título e Conteúdo:
   Defina um título objetivo e claro. No campo de conteúdo, descreva todos os detalhes necessários (ex.: datas de reuniões de serviço, providências de limpeza, etc.).

2. Anúncio Recorrente:
   Caso o aviso precise ser exibido mensalmente em uma época fixa (por exemplo, lembrete para entrega do relatório de serviço todo mês entre os dias 1 e 10), ative a opção "Anúncio Recorrente" e informe o dia inicial (1) e o dia final (10).

3. Data de Expiração:
   Indica o último dia em que o anúncio ficará visível no mural. Às 23:59 deste dia, ele é ocultado automaticamente. Se desejar que o anúncio fique sempre visível, deixe o campo de expiração em branco.
`}
                />
            )}

            {/* Banner de Dicas e Instruções */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-100 border border-surface-300 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-typography-800">
                            Publicação de Anúncio da Congregação
                        </h2>
                        <p className="text-xs text-typography-500">
                            Preencha os dados do anúncio no formulário à esquerda e acompanhe a pré-visualização em tempo real à direita.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setModalHelpShow(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-200 bg-primary-200/10 hover:bg-primary-200/20 rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                    <HelpCircle size={15} />
                    <span>Como programar anúncios</span>
                </button>
            </div>

            {/* Grid Principal: 7 colunas formulário + 5 colunas live preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA 1: Formulário de Configuração (7 colunas) */}
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="lg:col-span-7 bg-surface-100 border border-surface-300 rounded-2xl p-5 sm:p-7 shadow-sm flex flex-col gap-6"
                >
                    {/* Seção 1: Informações Principais */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-200/15 text-primary-200 font-bold text-xs flex items-center justify-center">
                                    1
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-typography-800">
                                    Conteúdo do Anúncio
                                </h3>
                            </div>
                            <span className="text-[11px] text-typography-400 font-medium">
                                * Campos obrigatórios
                            </span>
                        </div>

                        {/* Campo Título */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-typography-700">
                                    Título do Anúncio *
                                </label>
                                <span className="text-[10px] text-typography-400">
                                    {watchedTitle.length} caracteres
                                </span>
                            </div>
                            <input
                                type="text"
                                placeholder="Ex: Entrega do Relatório de Serviço de Campo"
                                {...register("title")}
                                className={`w-full px-4 py-2.5 text-sm bg-surface-200/50 border rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition ${
                                    errors.title ? "border-red-500 ring-1 ring-red-500/20" : "border-surface-300"
                                }`}
                            />
                            {errors.title?.message && (
                                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5">
                                    <AlertCircle size={12} />
                                    <span>{errors.title.message}</span>
                                </p>
                            )}
                        </div>

                        {/* Campo Conteúdo / Descrição */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-typography-700">
                                    Texto do Anúncio *
                                </label>
                                <span className="text-[10px] text-typography-400">
                                    {watchedText.length} caracteres
                                </span>
                            </div>
                            <textarea
                                rows={5}
                                placeholder="Escreva aqui a mensagem completa, instruções, locais ou datas para a congregação..."
                                {...register("text")}
                                className={`w-full px-4 py-3 text-sm bg-surface-200/50 border rounded-xl text-typography-800 placeholder:text-typography-400 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition resize-y thin-scrollbar leading-relaxed ${
                                    errors.text ? "border-red-500 ring-1 ring-red-500/20" : "border-surface-300"
                                }`}
                            />
                            {errors.text?.message && (
                                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-0.5">
                                    <AlertCircle size={12} />
                                    <span>{errors.text.message}</span>
                                </p>
                            )}
                            <p className="text-[11px] text-typography-400">
                                Quebras de linha e parágrafos serão mantidos na visualização do quadro.
                            </p>
                        </div>
                    </div>

                    {/* Seção 2: Programação & Recorrência */}
                    <div className="flex flex-col gap-4 border-t border-surface-200 pt-5">
                        <div className="flex items-center gap-2 border-b border-surface-200 pb-3">
                            <span className="w-6 h-6 rounded-full bg-primary-200/15 text-primary-200 font-bold text-xs flex items-center justify-center">
                                2
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-typography-800">
                                Programação de Exibição
                            </h3>
                        </div>

                        {/* Card Alternador de Anúncio Recorrente */}
                        <div
                            onClick={() => handleRecurrentNoticeChange(!recurrentNotice)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                recurrentNotice
                                    ? "bg-primary-200/5 border-primary-200 shadow-xs"
                                    : "bg-surface-200/40 border-surface-300 hover:border-surface-400"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        recurrentNotice
                                            ? "bg-primary-200 text-white"
                                            : "bg-surface-200 text-typography-500"
                                    }`}
                                >
                                    <Repeat size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-bold text-typography-800">
                                        Anúncio Recorrente Mensal
                                    </span>
                                    <p className="text-[11px] text-typography-500 mt-0.5 leading-relaxed">
                                        Exibir automaticamente todo mês apenas entre dias específicos (ex: lembrete de relatório entre os dias 1 e 10).
                                    </p>
                                </div>
                            </div>

                            {/* Switch Checkbox */}
                            <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1 transition-all ${
                                    recurrentNotice
                                        ? "bg-primary-200 text-white"
                                        : "border border-surface-400"
                                }`}
                            >
                                {recurrentNotice && <Check size={13} strokeWidth={3} />}
                            </div>
                        </div>

                        {/* Campos de Dia Inicial e Final quando Recorrente */}
                        {recurrentNotice && (
                            <div className="bg-surface-200/50 rounded-xl p-4 border border-surface-300 flex flex-col gap-3">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-200">
                                    <Clock size={14} />
                                    <span>Período do mês em que o anúncio ficará ativo:</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-typography-700">
                                            Dia inicial (1 a 31)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            placeholder="Ex: 1"
                                            {...register("startDay")}
                                            className="w-full px-3.5 py-2 text-sm bg-surface-100 border border-surface-300 rounded-xl text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-typography-700">
                                            Dia final (1 a 31)
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            placeholder="Ex: 10"
                                            {...register("endDay")}
                                            className="w-full px-3.5 py-2 text-sm bg-surface-100 border border-surface-300 rounded-xl text-typography-800 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 transition"
                                        />
                                    </div>
                                </div>

                                {isRecurrentRangeInvalid && (
                                    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                                        <AlertCircle size={13} />
                                        <span>Atenção: O dia inicial não pode ser maior do que o dia final.</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Seção 3: Data de Expiração */}
                    <div className="flex flex-col gap-4 border-t border-surface-200 pt-5">
                        <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-200/15 text-primary-200 font-bold text-xs flex items-center justify-center">
                                    3
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-typography-800">
                                    Data Limite de Expiração (Opcional)
                                </h3>
                            </div>
                            <span className="text-[11px] text-typography-400">
                                {selectedDate ? "Data agendada" : "Sem expiração (permanente)"}
                            </span>
                        </div>

                        <p className="text-xs text-typography-500 -mt-1">
                            O anúncio sairá do quadro automaticamente após as 23:59 da data escolhida. Se não definir uma data, ele permanecerá ativo até ser excluído.
                        </p>

                        {/* Atalhos Rápidos de Data */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-typography-500">
                                Atalhos:
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuickDatePreset(null)}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                                    !selectedDate
                                        ? "bg-primary-200/10 border-primary-200 text-primary-200"
                                        : "bg-surface-200/70 border-surface-300 text-typography-600 hover:bg-surface-300"
                                }`}
                            >
                                Permanente
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickDatePreset(7)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-surface-200/70 border border-surface-300 text-typography-600 hover:bg-surface-300 transition"
                            >
                                +7 dias
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickDatePreset(15)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-surface-200/70 border border-surface-300 text-typography-600 hover:bg-surface-300 transition"
                            >
                                +15 dias
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickDatePreset(30)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-surface-200/70 border border-surface-300 text-typography-600 hover:bg-surface-300 transition"
                            >
                                +30 dias
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickDatePreset(0)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-surface-200/70 border border-surface-300 text-typography-600 hover:bg-surface-300 transition"
                            >
                                Fim do mês
                            </button>
                        </div>

                        {/* Seletor de Calendário */}
                        <div className="w-full">
                            <Calendar
                                label="Selecione a data de término:"
                                minDate={dayjs().format("YYYY-MM-DD")}
                                selectedDate={selectedDate}
                                handleDateChange={handleDateChange}
                                full
                            />
                        </div>
                    </div>

                    {/* Ações / Botão de Envio */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-surface-200 pt-5 mt-2">
                        <Button
                            type="button"
                            outline
                            onClick={() => router.push("/congregacao/anuncios")}
                            className="w-full sm:w-auto text-xs py-2.5 px-5"
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting || disabled || isRecurrentRangeInvalid}
                            className="w-full sm:w-auto text-xs py-2.5 px-8 font-bold shadow-sm"
                        >
                            {isSubmitting ? "Publicando..." : "Publicar Anúncio"}
                        </Button>
                    </div>
                </form>

                {/* COLUNA 2: Pré-visualização em Tempo Real (5 colunas) */}
                <div className="lg:col-span-5 flex flex-col gap-4 sticky top-6">
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                        {/* Cabeçalho do Preview */}
                        <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                            <div className="flex items-center gap-2 text-primary-200 font-bold text-xs uppercase tracking-wider">
                                <Eye size={16} />
                                <span>Pré-visualização ao Vivo</span>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                Como os irmãos verão
                            </span>
                        </div>

                        {/* Card Exato do Quadro de Anúncios */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden group">
                            {/* Barra lateral de destaque da congregação */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-200" />

                            {/* Cabeçalho do Card */}
                            <div className="flex items-start justify-between gap-3 pl-1">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                                        <Bell size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-base font-bold text-typography-800 break-words">
                                            {watchedTitle.trim() || (
                                                <span className="text-typography-400 italic">
                                                    Título do anúncio...
                                                </span>
                                            )}
                                        </h4>

                                        {/* Status de vigência */}
                                        {recurrentNotice && (watchedStartDay || watchedEndDay) ? (
                                            <span className="text-[11px] text-typography-400 flex items-center gap-1 mt-0.5">
                                                <Clock size={12} className="text-primary-200" />
                                                <span>
                                                    Válido do dia {watchedStartDay || "X"} ao dia{" "}
                                                    {watchedEndDay || "Y"} de cada mês
                                                </span>
                                            </span>
                                        ) : selectedDate ? (
                                            <span className="text-[11px] text-typography-400 flex items-center gap-1 mt-0.5">
                                                <CalendarLucide size={12} className="text-primary-200" />
                                                <span>
                                                    Expira em {dayjs(selectedDate).format("DD/MM/YYYY")}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-typography-400 flex items-center gap-1 mt-0.5">
                                                <Info size={12} />
                                                <span>Exibição contínua (permanente)</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Botão Simulado de Copiar */}
                                <button
                                    type="button"
                                    onClick={handleSimulateCopy}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-200/80 hover:bg-primary-200/10 hover:text-primary-200 text-typography-600 text-xs font-semibold transition shrink-0"
                                    title="Copiar texto do anúncio"
                                >
                                    {previewCopied ? (
                                        <>
                                            <Check size={13} className="text-emerald-500" />
                                            <span className="text-emerald-500">Copiado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={13} />
                                            <span>Copiar</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Conteúdo / Corpo do Anúncio */}
                            <div className="pl-1 text-xs sm:text-sm text-typography-700 leading-relaxed whitespace-pre-wrap font-normal border-t border-surface-200 pt-3 min-h-[70px]">
                                {watchedText.trim() || (
                                    <span className="text-typography-400 italic">
                                        O conteúdo digitado no formulário aparecerá aqui exatamente como será exibido no quadro da congregação...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Nota informativa no rodapé do preview */}
                        <div className="bg-surface-200/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-typography-500 border border-surface-300/50">
                            <Info size={15} className="shrink-0 text-primary-200 mt-0.5" />
                            <p className="leading-normal">
                                Este anúncio ficará disponível na página pública de avisos da congregação{" "}
                                {congregation?.name ? `(${congregation.name})` : ""} e no quadro interativo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
