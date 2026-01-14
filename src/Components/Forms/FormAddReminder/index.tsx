import { createReminderAtom } from "@/atoms/remindersAtom"
import { CreateReminderPayload, RecurrenceType } from "@/atoms/remindersAtom/types"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import Dropdown from "@/Components/Dropdown"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import TextArea from "@/Components/TextArea"
import { useAuthContext } from "@/context/AuthContext"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import { useSetAtom } from "jotai"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import FormStyle from "../FormStyle"
import { createReminderSchema } from "./validations"


export default function FormAddReminder() {
    const createReminder = useSetAtom(createReminderAtom)
    const { user } = useAuthContext()

    const recurrenceOptions = [
        { value: RecurrenceType.DAILY, singular: "Dia", plural: "Dias" },
        { value: RecurrenceType.WEEKLY, singular: "Semana", plural: "Semanas" },
        { value: RecurrenceType.MONTHLY, singular: "Mês", plural: "Meses" },
        { value: RecurrenceType.YEARLY, singular: "Ano", plural: "Anos" },
    ]

    const intervalOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
    const countOptions = ["Sempre", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())]

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
            endDate: null,
            recurrenceInterval: 1,
            recurrenceCount: null
        }
    })

    const isRecurring = watch("isRecurring")
    const startDate = watch("startDate")
    const endDate = watch("endDate")
    const recurrenceType = watch("recurrenceType")
    const recurrenceInterval = watch("recurrenceInterval") ?? 1
    const recurrenceCount = watch("recurrenceCount")

    // Função de auxílio para pegar o label correto (singular/plural)
    const getLabel = (type: RecurrenceType | undefined, interval: number) => {
        const option = recurrenceOptions.find(opt => opt.value === type)
        if (!option) return ""
        return interval > 1 ? option.plural : option.singular
    }

    const selectedRecurrenceLabel = getLabel(recurrenceType, recurrenceInterval)

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
                                    title="Selecione"
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
                            
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Dropdown
                                        full
                                        textVisible
                                        border
                                        title="Selecione a quantidade"
                                        selectedItem={recurrenceCount === null ? "Sempre" : recurrenceCount?.toString()}
                                        options={countOptions}
                                        handleClick={(val) => {
                                            setValue("recurrenceCount", val === "Sempre" ? null : Number(val))
                                        }}
                                    />
                                </div>
                            </div>

                            <p className="text-[11px] text-typography-500 bg-surface-100 p-2 rounded border border-dashed border-surface-300">
                                💡 <strong>Resumo:</strong> O lembrete irá se repetir a cada <strong>{recurrenceInterval} {selectedRecurrenceLabel.toLowerCase()}</strong>.
                                {recurrenceCount
                                    ? ` O ciclo se encerrará após ${recurrenceCount} execuções.`
                                    : " Este lembrete não tem data de término definida (sempre ativo)."}
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
