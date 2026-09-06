import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import CheckboxUnique from "@/Components/CheckBoxUnique"
import { ConfirmDeleteModal } from "@/Components/ConfirmDeleteModal"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { usePublisher } from "@/hooks/usePublisher"
import { IPayloadCreateReportManually } from "@/types/reports"
import { IPublisher, IReports, Privileges, PrivilegesMinistry } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { Calendar, CheckCircle2, FileSpreadsheet, Info, Trash2 } from "lucide-react"
import 'moment/locale/pt-br'
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import InputError from "../../InputError"
import FormStyle from "../FormStyle"
import { FormValues } from "./types"

interface IRelatorioFormProps {
    report: IReports | null
    publisher: IPublisher | null
}

export default function FormReportManually({ report, publisher }: IRelatorioFormProps) {
    const { createReportManually, deleteReport } = usePublisher()
    const router = useRouter()
    const { month } = router.query
    const monthParam = month as string

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [privilege, setPrivilege] = useState<string>(Privileges.PUBLICADOR)
    const optionsCheckboxPrivilege = useState<string[]>(Object.values(PrivilegesMinistry))

    const validationSchema = yup.object({
        month: yup.string().required(),
        hours: yup.number(),
        studies: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        observations: yup.string()
    })

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            month: '',
            hours: report?.hours,
            studies: "",
            observations: ""
        },
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        if (report?.privileges && report.privileges.length > 0) {
            setPrivilege(report.privileges[0])
        }
    }, [report])

    useEffect(() => {
        setValue('month', capitalizeFirstLetter(monthParam))
        setValue('hours', privilege !== "Publicador" ? report?.hours : 0)
        if (report?.studies) {
            setValue('studies', report?.studies.toString())
        }
        setValue('observations', report?.observations ?? "")
    }, [report, monthParam, setValue, privilege])

    const handleCheckboxPrivilege = (selectedItems: string) => {
        setPrivilege(selectedItems)
    }

    async function onDelete(report_id: string) {
        await toast.promise(deleteReport(report_id), {
            pending: "Excluindo relatório..."
        }).then(() => {

        }).catch(err => {
            console.log(err)
        })
    }

    async function onSubmit({ hours, month, observations, studies }: FormValues) {
        const splitMonth = month.split(' ')
        const payload: IPayloadCreateReportManually = {
            hours: hours ?? 0,
            month: splitMonth[0],
            year: splitMonth[1],
            observations,
            publisher: {
                id: publisher?.id ?? "",
                privileges: [privilege]
            },
            studies: Number(studies)
        }
        toast.promise(
            createReportManually(payload),
            {
                pending: 'Criando relatório...'
            }
        ).then(() => {

        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex flex-col justify-center items-center w-full px-2 sm:px-4 py-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)} full className="max-w-2xl bg-surface-200/40 border border-surface-300 rounded-2xl p-5 sm:p-7 shadow-xs">
                <div className="w-full flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-surface-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 shrink-0">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-typography-800">
                                    {report ? "Editar Relatório" : "Lançar Relatório"}
                                </h3>
                                <p className="text-xs text-typography-500">
                                    {publisher?.fullName ? `Publicador(a): ${publisher.fullName}` : "Preencha as informações do mês"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            {report && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Lançado
                                </span>
                            )}
                            {report && (
                                <ConfirmDeleteModal
                                    title="Excluir Relatório"
                                    message={`Deseja realmente remover o relatório de ${publisher?.fullName || "este publicador"} para ${capitalizeFirstLetter(monthParam)}?`}
                                    onDelete={() => onDelete(`${report.id}`)}
                                    button={
                                        <Button
                                            type="button"
                                            outline
                                            remove
                                            size="sm"
                                            className="!min-w-0 !h-8 !px-3 !text-xs gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Excluir
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Mês de Referência */}
                    <div className="mb-4">
                        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
                            Mês de Referência
                        </label>
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-surface-300 bg-surface-200/60 text-typography-700 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-primary-200 shrink-0" />
                            <span>{capitalizeFirstLetter(monthParam)}</span>
                            <input
                                type="hidden"
                                {...register('month', { required: "Campo obrigatório" })}
                            />
                        </div>
                    </div>

                    {/* Privilégio */}
                    <div className="mb-4">
                        <CheckboxUnique
                            visibleLabel
                            checked={privilege}
                            label="Privilégio de Serviço no Mês"
                            options={optionsCheckboxPrivilege[0]}
                            handleCheckboxChange={(selectedItems) => handleCheckboxPrivilege(selectedItems)}
                        />
                    </div>

                    {/* Horas e Estudos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
                                Horas
                            </label>
                            <input
                                type={privilege !== 'Publicador' ? 'number' : 'text'}
                                placeholder={privilege === 'Publicador' ? "Dispensado" : "0"}
                                {...register('hours', {
                                    required: 'Campo Obrigatório'
                                })}
                                readOnly={privilege === 'Publicador'}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none ${
                                    errors?.hours
                                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border-surface-300 focus:border-primary-200 focus:ring-2 focus:ring-primary-200/20"
                                } ${
                                    privilege === 'Publicador'
                                        ? "bg-surface-200/60 text-typography-500 cursor-not-allowed"
                                        : "bg-surface-100 text-typography-800 placeholder:text-typography-400"
                                }`}
                            />
                            {privilege === 'Publicador' ? (
                                <p className="mt-1.5 text-xs text-typography-500 pl-1 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-primary-200 shrink-0" />
                                    <span>Publicadores apenas confirmam participação.</span>
                                </p>
                            ) : null}
                            {errors?.hours?.type && <InputError type={errors?.hours?.type} field='hours' />}
                        </div>

                        <div>
                            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
                                Estudos Bíblicos
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                min={0}
                                {...register('studies')}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none bg-surface-100 text-typography-800 placeholder:text-typography-400 ${
                                    errors?.studies?.message
                                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                                        : "border-surface-300 focus:border-primary-200 focus:ring-2 focus:ring-primary-200/20"
                                }`}
                            />
                            {errors?.studies?.type && <InputError type={errors?.studies?.type} field='studies' />}
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="mb-4">
                        <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
                            Observações (opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Pioneiro auxiliar em férias, doente, etc."
                            maxLength={50}
                            {...register('observations')}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none bg-surface-100 text-typography-800 placeholder:text-typography-400 ${
                                errors?.observations?.message
                                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    : "border-surface-300 focus:border-primary-200 focus:ring-2 focus:ring-primary-200/20"
                            }`}
                        />
                        {errors?.observations?.type && <InputError type={errors?.observations?.type} field='observations' />}
                    </div>

                    {/* Botão de envio */}
                    <div className="w-full mt-4">
                        <Button
                            className="w-full text-white bg-primary-200 hover:bg-primary-300 font-semibold rounded-xl h-11 transition-colors"
                            size="lg"
                            disabled={disabled}
                            error={dataError}
                            success={dataSuccess}
                            type='submit'
                        >
                            {report ? 'Atualizar Relatório' : 'Salvar Relatório'}
                        </Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
