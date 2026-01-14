import { updateReminderAtom } from "@/atoms/remindersAtom"
import { RecurrenceType, UpdateReminderPayload } from "@/atoms/remindersAtom/types"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import Input from "@/Components/Input"
import TextArea from "@/Components/TextArea"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import InputError from "@/Components/InputError"
import { useFetch } from "@/hooks/useFetch"
import { API_ROUTES } from "@/constants/apiRoutes"
import { IReminder } from "@/types/reminder"
import dayjs from "dayjs"
import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { editReminderSchema } from "./validations"
import { toast } from "react-toastify"
import FormStyle from "../FormStyle"
import Dropdown from "@/Components/Dropdown"

interface Props {
    reminder_id: string
}

export default function FormEditReminder({ reminder_id }: Props) {
    const updateReminder = useSetAtom(updateReminderAtom)

    const recurrenceOptions = [
        { label: "Dia", value: RecurrenceType.DAILY },
        { label: "Semana", value: RecurrenceType.WEEKLY },
        { label: "Mês", value: RecurrenceType.MONTHLY },
        { label: "Ano", value: RecurrenceType.YEARLY },
    ]

    const intervalOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const countOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

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
            recurrenceType: reminder.recurrenceType, // Adicionado
            recurrenceInterval: reminder.recurrenceInterval ?? null, // Nome corrigido
            recurrenceCount: reminder.recurrenceCount ?? null,
            isActive: reminder.isActive
        })
    }, [reminder, reset])

    const isRecurring = watch("isRecurring")
    const startDate = watch("startDate") ?? null
    const endDate = watch("endDate") ?? null
    const recurrenceType = watch("recurrenceType")
    const recurrenceInterval = watch("recurrenceInterval");
    const recurrenceCount = watch("recurrenceCount");

    const selectedRecurrenceLabel = recurrenceOptions.find(opt => opt.value === recurrenceType)?.label

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
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <span className={`my-6  w-11/12 font-semibold  sm:text-2xl text-primary-200`}>Atualizar lembrete</span>
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
                                    setValue("startDate", date)
                                    if (endDate && date && dayjs(endDate).isBefore(date)) {
                                        setValue("endDate", date)
                                    }
                                }}
                                full
                            />
                        </div>

                        <div className="w-full sm:w-44">
                            <Calendar
                                label="Data final"
                                selectedDate={endDate}
                                minDate={startDate}
                                handleDateChange={(date) => setValue("endDate", date)}
                                full
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
                        <div className="flex flex-col gap-2 p-4 bg-surface-50 rounded-md border border-surface-200">
                            <span className="text-sm text-typography-800 shrink-0">Repetir a cada</span>
                                <div className="flex items-center gap-4">
                                <div className="w-20">
                                    <Dropdown
                                        full
                                        textVisible
                                        border
                                        title="Selecione"
                                        selectedItem={recurrenceInterval?.toString() || "Selecione"}
                                        options={intervalOptions}
                                        handleClick={(val) => setValue("recurrenceInterval", Number(val))}
                                    />
                                </div>

                                <Dropdown
                                    full
                                    textVisible
                                    border
                                    title="Selecione o período"
                                    selectedItem={selectedRecurrenceLabel}
                                    options={recurrenceOptions.map(opt => opt.label)}
                                    handleClick={(label) => {
                                        const value = recurrenceOptions.find(opt => opt.label === label)?.value
                                        setValue("recurrenceType", value)
                                    }}
                                />
                        </div>
                            {errors?.recurrenceInterval && <InputError type="required" field="intervalo" />}

                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <Dropdown
                                full
                                textVisible
                                border
                                title="Quantidade de repetições"
                                selectedItem={recurrenceCount?.toString() || "Quantidade de repetições"}
                                options={countOptions}
                                handleClick={(val) => setValue("recurrenceCount", Number(val))}
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-typography-400 italic mt-1 text-center">
                        O lembrete será gerado por {recurrenceCount || 'X'} vez(es). Se deixar vazio, ele repetirá <strong>sempre</strong> no intervalo escolhido.
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

                <Button className="text-typography-200" type="submit">
                    Salvar alterações
                </Button>
            </div>
        </FormStyle>
        </section >

    )
}
