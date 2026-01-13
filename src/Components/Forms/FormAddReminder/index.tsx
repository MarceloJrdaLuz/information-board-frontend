import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import Button from "@/Components/Button"
import Input from "@/Components/Input"
import Calendar from "@/Components/Calendar"
import { useSetAtom } from "jotai"
import { createReminderAtom } from "@/atoms/remindersAtom"
import { CreateReminderPayload } from "@/atoms/remindersAtom/types"
import TextArea from "@/Components/TextArea"
import { Checkbox } from "@radix-ui/react-checkbox"
import FormStyle from "../FormStyle"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import InputError from "@/Components/InputError"
import { toast } from "react-toastify"
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { createReminderSchema } from "./validations"
import { useAuthContext } from "@/context/AuthContext"


export default function FormAddReminder() {
    const createReminder = useSetAtom(createReminderAtom)
    const { user } = useAuthContext()


    const {
        register,
        watch,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<CreateReminderPayload>({
        resolver: yupResolver(createReminderSchema),
        defaultValues: {
            isRecurring: false,
            startDate: null,
            endDate: null
        }
    })

    const isRecurring = watch("isRecurring")
    const startDate = watch("startDate")
    const endDate = watch("endDate")

    async function onSubmit(data: CreateReminderPayload) {
        await toast.promise(
            createReminder(user?.publisher?.id ?? "", data),
            { pending: "Criando lembrete..." }
        ).then(() => {
            reset()
        }).catch(err => console.log(err))
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle
                onSubmit={handleSubmit(onSubmit, onError)}
            >
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <span className={`my-6  w-11/12 font-semibold  sm:text-2xl text-primary-200`}>Criar novo lembrete</span>

                    <Input type="text" placeholder="Título" registro={{
                        ...register('title',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                    <TextArea placeholder="Descrição" registro={{
                        ...register('description')
                    }}
                        invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

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
                                    setValue("recurrenceIntervalDays", undefined)
                                    setValue("recurrenceCount", undefined)
                                }
                            }}
                        />
                    </div>


                    {isRecurring && (
                        // <div className="grid grid-cols-2 gap-4">
                        <>

                            <Input type="text" placeholder="Repetir a cada (dias)" registro={{
                                ...register('recurrenceIntervalDays',
                                    {
                                        required: "Campo obrigatório",
                                        min: { value: 1, message: "Mínimo 1 dia" }
                                    })
                            }}
                                invalid={errors?.recurrenceIntervalDays?.message ? 'invalido' : ''} />
                            {errors?.recurrenceIntervalDays?.type && <InputError type={errors.recurrenceIntervalDays.type} field='recurrenceIntervalDays' />}

                            <Input
                                type="number"
                                placeholder="Quantidade de repetições"
                                {...register("recurrenceCount")}
                            />
                        </>
                        // </div>
                    )}

                    <Button type="submit">
                        Criar lembrete
                    </Button>
                </div>

            </FormStyle>
        </section>
    )
}
