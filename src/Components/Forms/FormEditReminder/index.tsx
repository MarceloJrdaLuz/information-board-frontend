import { updateReminderAtom } from "@/atoms/remindersAtom"
import { UpdateReminderPayload } from "@/atoms/remindersAtom/types"
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

interface Props {
    reminder_id: string
}

export default function FormEditReminder({ reminder_id }: Props) {
    const updateReminder = useSetAtom(updateReminderAtom)

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
            recurrenceIntervalDays: reminder.recurrenceIntervalDays ?? null,
            recurrenceCount: reminder.recurrenceCount ?? null,
            isActive: reminder.isActive
        })
    }, [reminder, reset])

    const isRecurring = watch("isRecurring")
    const startDate = watch("startDate") ?? null
    const endDate = watch("endDate") ?? null

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
                        <Calendar
                            label="Data inicial"
                            selectedDate={startDate}
                            handleDateChange={(date) => {
                                setValue("startDate", date)
                                if (endDate && date && dayjs(endDate).isBefore(date)) {
                                    setValue("endDate", date)
                                }
                            }}
                        />

                        <Calendar
                            label="Data final"
                            selectedDate={endDate}
                            minDate={startDate}
                            handleDateChange={(date) => setValue("endDate", date)}
                        />
                    </div>
                    <div className="my-2">
                        <CheckboxBoolean
                            label="Lembrete recorrente"
                            checked={isRecurring}
                            handleCheckboxChange={(checked) => {
                                setValue("isRecurring", checked)
                                if (!checked) {
                                    setValue("recurrenceIntervalDays", null)
                                    setValue("recurrenceCount", null)
                                }
                            }}
                        />
                    </div>

                    {isRecurring && (
                        <>
                            <Input
                                type="number"
                                placeholder="Repetir a cada (dias)"
                                registro={{ ...register("recurrenceIntervalDays") }}
                                invalid={
                                    errors?.recurrenceIntervalDays?.message ? "invalido" : ""
                                }
                            />
                            {errors?.recurrenceIntervalDays && (
                                <InputError
                                    type={errors.recurrenceIntervalDays.type}
                                    field="recurrenceIntervalDays"
                                />
                            )}

                            <Input
                                type="number"
                                placeholder="Quantidade de repetições"
                                registro={{ ...register("recurrenceCount") }}
                            />
                        </>
                    )}
                    <div className="my-2">
                        <CheckboxBoolean
                            label="Lembrete ativo"
                            checked={watch("isActive")}
                            handleCheckboxChange={(checked) =>
                                setValue("isActive", checked)
                            }
                        />
                    </div>

                    <Button type="submit">
                        Salvar alterações
                    </Button>
                </div>
            </FormStyle>
        </section>

    )
}
