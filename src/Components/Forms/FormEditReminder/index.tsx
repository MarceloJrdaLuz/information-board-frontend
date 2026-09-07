import { updateReminderAtom } from "@/atoms/remindersAtom"
import { RecurrenceType, UpdateReminderPayload } from "@/atoms/remindersAtom/types"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import Dropdown from "@/Components/Dropdown"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import TextArea from "@/Components/TextArea"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useFetch } from "@/hooks/useFetch"
import { IReminder } from "@/types/reminder"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import FormStyle from "../FormStyle"
import { editReminderSchema } from "./validations"

interface Props {
    reminder_id: string
}

export default function FormEditReminder({ reminder_id }: Props) {
    const updateReminder = useSetAtom(updateReminderAtom)

    const recurrenceOptions = [
        { value: RecurrenceType.DAILY, singular: "Dia", plural: "Dias" },
        { value: RecurrenceType.WEEKLY, singular: "Semana", plural: "Semanas" },
        { value: RecurrenceType.MONTHLY, singular: "Mês", plural: "Meses" },
        { value: RecurrenceType.YEARLY, singular: "Ano", plural: "Anos" },
    ]

    const intervalOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const countOptions = ["Sempre", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

    const { data: reminder } = useFetch<IReminder>(
        `${API_ROUTES.PUBLISHER_REMINDERS}/${reminder_id}`
    )

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<UpdateReminderPayload>({
        resolver: yupResolver(editReminderSchema),
        defaultValues: {
            isRecurring: false,
            isActive: true
        }
    })

    /** 🔁 quando o reminder carregar */
    useEffect(() => {
        if (!reminder) return

        reset({
            title: reminder.title,
            description: reminder.description ?? "",
            startDate: reminder.startDate,
            endDate: reminder.endDate,
            isRecurring: reminder.isRecurring,
            recurrenceType: reminder.recurrenceType,
            recurrenceInterval: reminder.recurrenceInterval ?? 1,
            recurrenceCount: reminder.recurrenceCount ?? null,
            isActive: reminder.isActive
        })
    }, [reminder, reset])

    const isRecurring = watch("isRecurring")
    const startDate = watch("startDate") ?? null
    const endDate = watch("endDate") ?? null
    const recurrenceType = watch("recurrenceType")
    const recurrenceInterval = watch("recurrenceInterval") ?? 1
    const recurrenceCount = watch("recurrenceCount")

    const getLabel = (type: RecurrenceType | undefined, interval: number) => {
        const option = recurrenceOptions.find(opt => opt.value === type)
        if (!option) return "Selecione o período"
        return interval > 1 ? option.plural : option.singular
    }

    const selectedRecurrenceLabel = getLabel(recurrenceType, recurrenceInterval)

    async function onSubmit(data: UpdateReminderPayload) {
        console.log(data)
        await toast.promise(
            updateReminder(reminder_id, data),
            { pending: "Salvando alterações..." }
        )
    }

    function onError() {
        toast.error("Confira os campos do formulário")
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle
                onSubmit={handleSubmit(onSubmit, onError)}
            >
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Atualizar lembrete</div>
                    <Input
                        placeholder="Título"
                        registro={{ ...register("title") }}
                        invalid={errors?.title?.message ? "invalido" : ""}
                    />
                    {errors?.title && (
                        <InputError type={errors.title.type} field="title" />
                    )}

                    <TextArea
                        placeholder="Descrição"
                        registro={{ ...register("description") }}
                    />

                    <div className="flex justify-around flex-wrap">
                        <div className="w-full sm:w-44">
                            <Calendar
                                label="Data inicial"
                                selectedDate={startDate}
                                handleDateChange={(date) => {
                                    setValue("startDate", date, { shouldValidate: true, shouldTouch: true })
                                    if (endDate && date && dayjs(endDate).isBefore(date)) {
                                        setValue("endDate", date, { shouldValidate: true, shouldTouch: true })
                                    }
                                }}
                                full
                                error={errors.startDate?.message}
                            />
                        </div>

                        <div className="w-full sm:w-44">
                            <Calendar
                                label="Data final"
                                selectedDate={endDate}
                                minDate={startDate}
                                handleDateChange={(date) => setValue("endDate", date, { shouldValidate: true, shouldTouch: true })}
                                full
                                error={errors.endDate?.message}
                            />
                        </div>
                    </div>
                    <div className="my-2">
                        <CheckboxBoolean
                            label="Lembrete recorrente"
                            checked={isRecurring}
                            handleCheckboxChange={(checked) => {
                                setValue("isRecurring", checked)
                                if (checked) {
                                    setValue("recurrenceType", RecurrenceType.DAILY)
                                    setValue("recurrenceInterval", 1)
                                } else {
                                    setValue("recurrenceInterval", null)
                                    setValue("recurrenceCount", null)
                                    setValue("recurrenceType", undefined)
                                }
                            }}
                        />
                    </div>

                    {isRecurring && (
                        <div className="flex flex-col gap-4 p-4 bg-surface-200/50 rounded-md border border-surface-300">
                            <span className="text-sm text-typography-800 font-medium">Repetir a cada</span>

                            <div className="flex items-center gap-4">
                                <div className="w-24">
                                    <Dropdown
                                        title=""
                                        full
                                        textVisible
                                        border
                                        selectedItem={recurrenceInterval.toString()}
                                        options={intervalOptions}
                                        handleClick={(val) => setValue("recurrenceInterval", Number(val))}
                                    />
                                </div>

                                <div className="flex-1">
                                    <Dropdown
                                        title=""
                                        full
                                        textVisible
                                        border
                                        selectedItem={selectedRecurrenceLabel}
                                        options={recurrenceOptions.map(opt =>
                                            recurrenceInterval > 1 ? opt.plural : opt.singular
                                        )}
                                        handleClick={(label) => {
                                            const found = recurrenceOptions.find(o => o.singular === label || o.plural === label)
                                            if (found) setValue("recurrenceType", found.value)
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <Dropdown
                                    full
                                    textVisible
                                    border
                                    title="Quantidade de repetições"
                                    selectedItem={recurrenceCount === null ? "Sempre" : recurrenceCount?.toString()}
                                    options={countOptions}
                                    handleClick={(val) => setValue("recurrenceCount", val === "Sempre" ? null : Number(val))}
                                />
                            </div>

                            <p className="text-[11px] text-typography-500 bg-surface-100 p-2 rounded border border-dashed border-surface-300">
                                💡 <strong>Resumo:</strong> O lembrete irá se repetir a cada <strong>{recurrenceInterval} {selectedRecurrenceLabel.toLowerCase()}</strong>.
                                {recurrenceCount
                                    ? ` O ciclo se encerrará após ${recurrenceCount} execuções.`
                                    : " Este lembrete não tem data de término definida (sempre ativo)."}
                            </p>
                        </div>
                    )}
                    <div className="my-2">
                        <CheckboxBoolean
                            label="Lembrete ativo"
                            checked={watch("isActive")}
                            handleCheckboxChange={(checked) => setValue("isActive", checked)}
                        />
                    </div>

                    <div className="w-full mt-6">
                        <Button className="w-full text-typography-200" type="submit">
                            Salvar alterações
                        </Button>
                    </div>
                </div>
            </FormStyle>
        </section >

    )
}
