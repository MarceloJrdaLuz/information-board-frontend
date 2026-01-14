import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import Button from "@/Components/Button"
import Input from "@/Components/Input"
import Calendar from "@/Components/Calendar"
import { useSetAtom } from "jotai"
import { createReminderAtom } from "@/atoms/remindersAtom"
import { CreateReminderPayload, RecurrenceType } from "@/atoms/remindersAtom/types"
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
import Dropdown from "@/Components/Dropdown"


export default function FormAddReminder() {
    const createReminder = useSetAtom(createReminderAtom)
    const { user } = useAuthContext()

    const recurrenceOptions = [
        { label: "Dia", value: RecurrenceType.DAILY },
        { label: "Semana", value: RecurrenceType.WEEKLY },
        { label: "Mês", value: RecurrenceType.MONTHLY },
        { label: "Ano", value: RecurrenceType.YEARLY },
    ]

    const intervalOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const countOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

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
    const recurrenceType = watch("recurrenceType")
    const selectedRecurrenceLabel = recurrenceOptions.find(opt => opt.value === recurrenceType)?.label
    const recurrenceInterval = watch("recurrenceInterval");
    const recurrenceCount = watch("recurrenceCount");

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
                        <div className="w-full sm:w-44">
                            <Calendar
                                full
                                label="Data inicial"
                                selectedDate={startDate}
                                handleDateChange={(date) => {
                                    setValue("startDate", date)
                                    if (endDate && date && dayjs(endDate).isBefore(date)) {
                                        setValue("endDate", date)
                                    }
                                }}
                            />
                        </div>

                        <div className="w-full sm:w-44">
                            <Calendar
                                full
                                label="Data final"
                                selectedDate={endDate}
                                minDate={startDate}
                                handleDateChange={(date) => setValue("endDate", date)}
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
                                    setValue("recurrenceType", undefined)
                                }
                            }}
                        />
                    </div>
                    {isRecurring && (
                        <div className="flex flex-col gap-2 p-4 bg-surface-50 rounded-md border border-surface-300 mb-8">
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
                                O lembrete será gerado por {recurrenceCount || 'X'} vez(es). Se deixar vazio, ele repetirá sempre no intervalo escolhido.
                            </p>
                        </div>
                    )}

                    <Button className="text-typography-200" type="submit">
                        Criar lembrete
                    </Button>
                </div>

            </FormStyle>
        </section>
    )
}
