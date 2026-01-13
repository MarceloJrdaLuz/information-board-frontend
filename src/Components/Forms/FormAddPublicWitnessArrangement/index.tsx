import { yupResolver } from "@hookform/resolvers/yup"
import { useSetAtom, useAtomValue } from "jotai"
import { useForm, useFieldArray } from "react-hook-form"
import { useEffect, useState } from "react"
import * as yup from "yup"
import { toast } from "react-toastify"

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"

import Button from "@/Components/Button"
import Input from "@/Components/Input"
import Dropdown from "@/Components/Dropdown"

import { useCongregationContext } from "@/context/CongregationContext"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import { createPublicWitnessArrangementAtom } from "@/atoms/publicWitnessAtoms.ts"
import { CreatePublicWitnessArrangementPayload } from "@/atoms/publicWitnessAtoms.ts/types"
import { useFetch } from "@/hooks/useFetch"
import { IPublisher } from "@/types/types"
import InputError from "@/Components/InputError"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import DropdownMulti from "@/Components/DropdownMulti"
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
                <div className={`my-1 m-auto w-11/12 font-semibold text-xl text-primary-200`}>Novo arranjo</div>
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
                    handleClick={opt =>
                        opt === "Fixo"
                            ? reset({ ...watch(), is_fixed: true })
                            : reset({ ...watch(), is_fixed: false })
                    }
                    full
                    border
                />

                {isFixed ? (
                    <Dropdown
                        textVisible
                        title="Dia da semana"
                        options={Object.entries(WEEKDAY_LABEL).map(([k, v]) => `${k} - ${v}`)}
                        handleClick={opt =>
                            reset({ ...watch(), weekday: Number(opt.split(" - ")[0]) })
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
                    <Input type="date" registro={{ ...register("date") }} />
                )}

                {/* Horários */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="border p-4 rounded flex flex-col gap-3">
                                {/* Horários */}
                                <div className="flex gap-2 flex-wrap items-center">
                                    <Input
                                        placeholder="Início"
                                        type="time"
                                        registro={{ ...register(`timeSlots.${index}.start_time`) }}
                                    />
                                    <Input
                                        placeholder="Fim"
                                        type="time"
                                        registro={{ ...register(`timeSlots.${index}.end_time`) }}
                                    />
                                </div>

                                {/* Rodízio */}
                                <CheckboxBoolean
                                    checked={watch(`timeSlots.${index}.is_rotative`) ?? false}
                                    handleCheckboxChange={(checked) =>
                                        setValue(`timeSlots.${index}.is_rotative`, checked, { shouldDirty: true })
                                    }
                                    label="Rodízio?"
                                />


                                {/* Publicadores fixos */}
                                {!watch(`timeSlots.${index}.is_rotative`) && (
                                    <DropdownMulti<IPublisher>
                                        title="Publicadores do horário (opcional)"
                                        items={publishers}
                                        selectedItems={watch(`timeSlots.${index}.defaultPublishers`) ?? []}
                                        handleChange={(selected) => {
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
                                )}
                                <Button
                                    outline
                                    className="text-red-500"
                                    type="button"
                                    onClick={() => {
                                        remove(index)
                                    }}
                                >
                                    Remover horário
                                </Button>
                            </div>
                        ))}


                        <Button
                            type="button"
                            outline
                            onClick={() =>
                                append({
                                    start_time: "",
                                    end_time: "",
                                    defaultPublishers: []
                                })
                            }
                        >
                            + Adicionar horário
                        </Button>
                    </div>



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
