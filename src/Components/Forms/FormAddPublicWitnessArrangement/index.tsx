import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"

import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import Dropdown from "@/Components/Dropdown"
import Input from "@/Components/Input"

import { createPublicWitnessArrangementAtom } from "@/atoms/publicWitnessAtoms.ts"
import { CreatePublicWitnessArrangementPayload } from "@/atoms/publicWitnessAtoms.ts/types"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import DropdownMulti from "@/Components/DropdownMulti"
import InputError from "@/Components/InputError"
import { useCongregationContext } from "@/context/CongregationContext"
import { useFetch } from "@/hooks/useFetch"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import { IPublisher } from "@/types/types"
import dayjs from "dayjs"
import { Clock, Plus, RefreshCw, Trash2 } from "lucide-react"
import FormStyle from "../FormStyle"

type FormValues = {
    title: string
    is_fixed: boolean
    weekday?: number
    date?: string
    timeSlots: {
        start_time: string
        end_time: string
        defaultPublishers: IPublisher[]
        preferences?: IPublisher[]
        is_rotative?: boolean
    }[]
}

const validation = yup.object({
    title: yup.string().required("Campo obrigatório"),
    is_fixed: yup.boolean().required(),
    weekday: yup.number().nullable(),
    date: yup.string().nullable(),
    timeSlots: yup.array().of(
        yup.object({
            start_time: yup.string().required("Obrigatório"),
            end_time: yup.string().required("Obrigatório")
        })
    ).min(1, "Adicione ao menos um horário")
})

export default function FormAddPublicWitnessArrangement() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id ?? ""

    const { data, mutate } = useFetch<IPublisher[]>(`/form-data?form=publicWitness`)
    const [publishers, setPublishers] = useState<IPublisher[]>([])

    useEffect(() => {
        if (data) {
            setPublishers(data)
        }
    }, [data])

    const createArrangement = useSetAtom(createPublicWitnessArrangementAtom)
    const disabled = useAtomValue(buttonDisabled)
    const dataError = useAtomValue(errorFormSend)
    const dataSuccess = useAtomValue(successFormSend)

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: yupResolver(validation),
        defaultValues: {
            is_fixed: true,
            timeSlots: [{
                start_time: "",
                end_time: "",
                defaultPublishers: [],
                preferences: [],
                is_rotative: false
            }]

        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "timeSlots"
    })

    const selectedWeekday = watch("weekday")


    const isFixed = watch("is_fixed")

    async function onSubmit(data: FormValues) {
        const payload: CreatePublicWitnessArrangementPayload = {
            title: data.title,
            is_fixed: data.is_fixed,
            weekday: data.is_fixed ? data.weekday : null,
            date: !data.is_fixed ? data.date : null,
            timeSlots: data.timeSlots.map((slot, index) => ({
                start_time: slot.start_time,
                end_time: slot.end_time,
                order: index + 1,
                is_rotative: slot.is_rotative ?? false,
                defaultPublishers: slot.defaultPublishers.map(p => ({
                    publisher_id: p.id
                })),
                preferences: (slot.preferences ?? []).map(p => ({
                    publisher_id: p.id
                }))
            }))
        }

        await toast.promise(
            createArrangement(congregation_id, payload),
            { pending: "Criando arranjo..." }
        ).then(() => reset()
        ).catch(err => console.log(err))

        reset()
    }

    function onError() {
        toast.error("Preencha todos os campos corretamente.")
    }

    return (
        <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="w-full flex flex-col gap-2">
                <div className="form-title-modern">Novo arranjo</div>
                <Input
                    placeholder="Título do arranjo"
                    registro={{ ...register("title") }}
                    invalid={errors.title ? "invalido" : ""}
                />
                {errors.title && <InputError type={errors.title.type} field="title" />}

                <Dropdown
                    textVisible
                    title="Tipo de arranjo"
                    options={["Fixo", "Data específica"]}
                    selectedItem={isFixed ? "Fixo" : "Data específica"}
                    handleClick={opt => {
                        const fixed = opt === "Fixo"
                        setValue("is_fixed", fixed, { shouldDirty: true })
                        if (fixed) {
                            setValue("date", undefined)
                        } else {
                            setValue("weekday", undefined)
                        }
                    }}
                    full
                    border
                />

                {isFixed ? (
                    <Dropdown
                        textVisible
                        title="Dia da semana"
                        options={Object.entries(WEEKDAY_LABEL).map(([k, v]) => `${k} - ${v}`)}
                        handleClick={opt =>
                            setValue("weekday", Number(opt.split(" - ")[0]), { shouldDirty: true })
                        }
                        selectedItem={
                            selectedWeekday !== undefined && selectedWeekday !== null
                                ? `${selectedWeekday} - ${WEEKDAY_LABEL[selectedWeekday as Weekday]}`
                                : undefined
                        }
                        full
                        border
                    />
                ) : (
                    <div className="flex flex-col gap-1.5 my-1">
                        <Calendar
                            label="Data específica do arranjo:"
                            selectedDate={watch("date") || null}
                            handleDateChange={date =>
                                setValue("date", date ?? undefined, { shouldDirty: true, shouldValidate: true })
                            }
                            minDate={dayjs().format("YYYY-MM-DD")}
                            full
                        />
                        {errors.date && (
                            <span className="text-xs text-red-500 font-medium">
                                {errors.date.message}
                            </span>
                        )}
                    </div>
                )}

                {/* Seção de Horários */}
                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-between pt-2 pb-1 border-b border-surface-300">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary-100/40 text-primary-200">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-typography-800 block">
                                    Turnos e Horários
                                </span>
                                <span className="text-[11px] text-typography-500">
                                    Configure os períodos e a equipe de publicadores
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-200 text-typography-700">
                            {fields.length} {fields.length === 1 ? "turno" : "turnos"}
                        </span>
                    </div>

                    {fields.map((field, index) => {
                        const isRotative = watch(`timeSlots.${index}.is_rotative`) ?? false
                        const startTime = watch(`timeSlots.${index}.start_time`)
                        const endTime = watch(`timeSlots.${index}.end_time`)

                        return (
                            <div
                                key={field.id}
                                className="relative rounded-2xl border border-surface-300 bg-surface-100/60 dark:bg-surface-800/30 p-4 sm:p-5 shadow-xs transition hover:border-surface-400 flex flex-col gap-4"
                            >
                                {/* Header do card do turno */}
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-surface-200 dark:border-surface-700/60">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-200/15 text-primary-200 text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-xs font-semibold text-typography-800">
                                            Turno {index + 1}
                                            {startTime && endTime && (
                                                <span className="ml-2 font-mono text-[11px] text-typography-500 bg-surface-200 dark:bg-surface-700/60 px-2 py-0.5 rounded-md font-normal">
                                                    {startTime} às {endTime}
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-typography-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition"
                                            title="Remover este horário"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Grid de Horários */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider block mb-1">
                                            Início
                                        </span>
                                        <Input
                                            placeholder="08:00"
                                            type="time"
                                            registro={{ ...register(`timeSlots.${index}.start_time`) }}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider block mb-1">
                                            Fim
                                        </span>
                                        <Input
                                            placeholder="10:00"
                                            type="time"
                                            registro={{ ...register(`timeSlots.${index}.end_time`) }}
                                        />
                                    </div>
                                </div>

                                {/* Alternância Rodízio / Fixo */}
                                <div className="rounded-xl border border-surface-200 dark:border-surface-700/50 bg-surface-200/40 p-3 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <RefreshCw
                                                className={`w-4 h-4 ${
                                                    isRotative ? "text-primary-200" : "text-typography-400"
                                                }`}
                                            />
                                            <span className="text-xs font-semibold text-typography-800">
                                                Modo Rodízio Automático
                                            </span>
                                        </div>
                                        <CheckboxBoolean
                                            id={`rotative-add-${index}`}
                                            checked={isRotative}
                                            handleCheckboxChange={checked =>
                                                setValue(`timeSlots.${index}.is_rotative`, checked, {
                                                    shouldDirty: true
                                                })
                                            }
                                        />
                                    </div>
                                    <p className="text-[11px] text-typography-500">
                                        {isRotative
                                            ? "O sistema distribui publicadores rotativamente a cada escala mensal."
                                            : "Publicadores específicos fixos designados diretamente para este horário."}
                                    </p>
                                </div>

                                {/* Seletores de Publicadores */}
                                {!isRotative ? (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider">
                                            Publicadores Fixos do Horário
                                        </span>
                                        <DropdownMulti<IPublisher>
                                            title="Selecione os publicadores (opcional)"
                                            items={publishers}
                                            selectedItems={watch(`timeSlots.${index}.defaultPublishers`) ?? []}
                                            handleChange={selected => {
                                                setValue(
                                                    `timeSlots.${index}.defaultPublishers`,
                                                    selected,
                                                    { shouldDirty: true }
                                                )
                                            }}
                                            border
                                            full
                                            position="left"
                                            labelKey="fullName"
                                            textVisible
                                            searchable
                                            emptyMessage="Nenhum publicador encontrado"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider">
                                            Preferência de Publicadores (Opcional)
                                        </span>
                                        <DropdownMulti<IPublisher>
                                            title="Publicadores que preferem este horário"
                                            items={publishers}
                                            selectedItems={watch(`timeSlots.${index}.preferences`) ?? []}
                                            handleChange={selected => {
                                                setValue(
                                                    `timeSlots.${index}.preferences`,
                                                    selected,
                                                    { shouldDirty: true }
                                                )
                                            }}
                                            border
                                            full
                                            position="left"
                                            labelKey="fullName"
                                            textVisible
                                            searchable
                                            emptyMessage="Nenhum publicador encontrado"
                                        />
                                        <span className="text-[11px] text-typography-500 italic px-0.5">
                                            Publicadores com preferência definida neste turno não serão alocados em outros pelo gerador automático.
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Botão Adicionar Horário */}
                    <button
                        type="button"
                        onClick={() =>
                            append({
                                start_time: "",
                                end_time: "",
                                defaultPublishers: [],
                                preferences: [],
                                is_rotative: false
                            })
                        }
                        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary-200/50 hover:border-primary-200 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 text-primary-200 dark:text-primary-300 font-semibold text-xs flex items-center justify-center gap-2 transition group shadow-2xs"
                    >
                        <div className="w-5 h-5 rounded-full bg-primary-200/15 group-hover:bg-primary-200/25 flex items-center justify-center transition">
                            <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span>Adicionar outro horário</span>
                    </button>
                </div>

                <Button
                    type="submit"
                    disabled={disabled}
                    error={dataError}
                    success={dataSuccess}
                >
                    Criar arranjo
                </Button>
            </div>
        </FormStyle>
    )
}
