import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import { useSubmitContext } from "@/context/SubmitFormContext"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { obterUltimosMeses } from "@/functions/meses"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/services/api"
import { IMeetingAssistance } from "@/types/types"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import Input from "../../Input"
import InputError from "../../InputError"
import FormStyle from "../FormStyle"
import { FormValues } from "./types"

interface IFormAssistanceProps {
    congregation_id: string
}

export default function FormAssistencia({ congregation_id }: IFormAssistanceProps) {
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const [monthWithYear, setMonthWithYear] = useState('')
    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')
    const [alreadyExists, setAlreadyExists] = useState<IMeetingAssistance[]>()
    const [optionsDropdown, setOptionDropdown] = useState<string[]>([...obterUltimosMeses().anoCorrente, ...obterUltimosMeses().anoAnterior])
    const { data } = useFetch<IMeetingAssistance[]>(`/assistance/${congregation_id}`)
    const [midWeekTotal, setMidWeekTotal] = useState(0)
    const [midWeekAverage, setMidWeekAverage] = useState(0)
    const [endWeekAverage, setEndWeekAverage] = useState(0)
    const [endWeekTotal, setEndWeekTotal] = useState(0)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        let dividirPalavra = monthWithYear.split(" ")
        setMonthSelected(dividirPalavra[0])
        setYearSelected(dividirPalavra[1])
    }, [monthWithYear])

    useEffect(() => {
        setMonthWithYear(optionsDropdown[0])
    }, [optionsDropdown, setMonthSelected])


    useEffect(() => {
        if (data) {
            const filter = data.filter(meetingAssistance => meetingAssistance.month === capitalizeFirstLetter(monthSelected) && meetingAssistance.year === yearSelected)
            if (filter.length > 0) {
                setAlreadyExists(filter)
            }
        }
    }, [data, setAlreadyExists, monthSelected, yearSelected])

    useEffect(() => {
        console.log(alreadyExists)
    }, [alreadyExists])

    const esquemaValidacao = yup.object({
        midWeek1: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        midWeek2: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        midWeek3: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        midWeek4: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        midWeek5: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        endWeek1: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        endWeek2: yup.number().transform((originalValue) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        endWeek3: yup.number().transform((originalValue, originalObject) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        endWeek4: yup.number().transform((originalValue, originalObject) => {
            return isNaN(originalValue) ? 0 : originalValue
        }),
        endWeek5: yup.number().transform((originalValue, originalObject) => {
            return isNaN(originalValue) ? 0 : originalValue
        })
    })

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            midWeek1: 0,
            midWeek2: 0,
            midWeek3: 0,
            midWeek4: 0,
            midWeek5: 0,
            endWeek1: 0,
            endWeek2: 0,
            endWeek3: 0,
            endWeek4: 0,
            endWeek5: 0,
        },
        resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        if (alreadyExists && alreadyExists.length > 0) {
            const existingData = alreadyExists[0]
            setValue('midWeek1', Number(existingData.midWeek[0]))
            setValue('midWeek2', Number(existingData.midWeek[1]))
            setValue('midWeek3', Number(existingData.midWeek[2]))
            setValue('midWeek4', Number(existingData.midWeek[3]))
            setValue('midWeek5', Number(existingData.midWeek[4]))
            setValue('endWeek1', Number(existingData.endWeek[0]))
            setValue('endWeek2', Number(existingData.endWeek[1]))
            setValue('endWeek3', Number(existingData.endWeek[2]))
            setValue('endWeek4', Number(existingData.endWeek[3]))
            setValue('endWeek5', Number(existingData.endWeek[4]))
        }
    }, [alreadyExists, setValue])

    const sendAssistence = async (data: {
        month: string,
        year: string,
        endWeek: number[],
        midWeek: number[]
    }) => {
        const endWeeksAsString = data.endWeek.map(String)
        const midWeeksAsString = data.midWeek.map(String)

        const payload = {
            month: capitalizeFirstLetter(data.month),
            year: data.year,
            midWeek: midWeeksAsString,
            midWeekTotal,
            midWeekAverage,
            endWeek: endWeeksAsString,
            endWeekTotal,
            endWeekAverage,
        }

        api.post(`/assistance/${congregation_id}`, {
            ...payload
        }).then(suc => {
            handleSubmitSuccess(messageSuccessSubmit.assistanceCreate, `/congregacao/assistencia/${congregation_id}`)
        }).catch(err => {
            console.log(err)
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    const watchedFieldsMidWeeks = watch(["midWeek1", "midWeek2", "midWeek3", "midWeek4", "midWeek5"])
    const watchedFieldsEndWeeks = watch(["endWeek1", "endWeek2", "endWeek3", "endWeek4", "endWeek5"])

    useEffect(() => {
        setMidWeekTotal(watchedFieldsMidWeeks.reduce((total, value) => total + Number(value), 0))
        setMidWeekAverage(watchedFieldsMidWeeks.length > 0
            ? Math.round((watchedFieldsMidWeeks.reduce((total, value) => total + Number(value), 0) / watchedFieldsMidWeeks.filter(value => Number(value) > 0).length) || 0)
            : 0)

        setEndWeekTotal(watchedFieldsEndWeeks.reduce((total, value) => total + Number(value), 0))
        setEndWeekAverage(watchedFieldsEndWeeks.length > 0
            ? Math.round((watchedFieldsEndWeeks.reduce((total, value) => total + Number(value), 0) / watchedFieldsEndWeeks.filter(value => Number(value) > 0).length) || 0)
            : 0)
    }, [watchedFieldsMidWeeks, watchedFieldsEndWeeks])

    function onSubmit(data: FormValues) {
        toast.promise(sendAssistence({
            month: monthSelected,
            year: yearSelected,
            midWeek: watchedFieldsMidWeeks,
            endWeek: watchedFieldsEndWeeks
        }), {
            pending: 'Enviando assistência...'
        })
    }

    const handleClick = (selected: string) => {
        setMonthWithYear(selected)
    }

    function onError(error: any) {
        console.log(error)
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="w-full flex flex-col items-center">
            <div className={`w-full h-auto flex-col justify-center items-center`}>
                <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Assistência</div>
            </div>

            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div>
                    <Dropdown textVisible selectedItem={monthWithYear} border handleClick={(option) => handleClick(option)} options={optionsDropdown} title="Selecione o mês" />
                    <div className="flex flex-col w-full  border border-blue-gray-200 py-6 px-16 my-4">
                        <h2 className="font-semibold">Reunião do meio de semana</h2>
                        <Input type="number" placeholder="1ª semana" registro={{ ...register('midWeek1') }} invalid={errors?.midWeek1?.message ? 'invalido' : ''} />
                        {errors?.midWeek1?.type && <InputError type={errors.midWeek1.type} field='midWeek1' />}
                        <Input type="number" placeholder="2ª semana" registro={{ ...register('midWeek2') }} invalid={errors?.midWeek2?.message ? 'invalido' : ''} />
                        {errors?.midWeek2?.type && <InputError type={errors.midWeek2.type} field='midWeek2' />}
                        <Input type="number" placeholder="3ª semana" registro={{ ...register('midWeek3') }} invalid={errors?.midWeek3?.message ? 'invalido' : ''} />
                        {errors?.midWeek3?.type && <InputError type={errors.midWeek3.type} field='midWeek3' />}
                        <Input type="number" placeholder="4ª semana" registro={{ ...register('midWeek4') }} invalid={errors?.midWeek4?.message ? 'invalido' : ''} />
                        {errors?.midWeek4?.type && <InputError type={errors.midWeek4.type} field='midWeek4' />}
                        <Input type="number" placeholder="5ª semana" registro={{ ...register('midWeek5') }} invalid={errors?.midWeek5?.message ? 'invalido' : ''} />
                        {errors?.midWeek5?.type && <InputError type={errors.midWeek5.type} field='midWeek5' />}
                        <div className="font-semibold">
                            <span className="pr-2">Totais:</span>
                            <span>{midWeekTotal}</span>
                        </div>
                        <div className="font-semibold">
                            <span className="pr-2">Média:</span>
                            <span>{midWeekAverage}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full border border-blue-gray-200 py-6 px-16 my-4">
                        <h2 className="font-semibold">Reunião do fim de semana</h2>
                        <Input type="number" placeholder="1ª semana" registro={{ ...register('endWeek1') }} invalid={errors?.endWeek1?.message ? 'invalido' : ''} />
                        {errors?.endWeek1?.type && <InputError type={errors.endWeek1.type} field='endWeek1' />}
                        <Input type="number" placeholder="2ª semana" registro={{ ...register('endWeek2') }} invalid={errors?.endWeek2?.message ? 'invalido' : ''} />
                        {errors?.endWeek2?.type && <InputError type={errors.endWeek2.type} field='endWeek2' />}
                        <Input type="number" placeholder="3ª semana" registro={{ ...register('endWeek3') }} invalid={errors?.endWeek3?.message ? 'invalido' : ''} />
                        {errors?.endWeek3?.type && <InputError type={errors.endWeek3.type} field='endWeek3' />}
                        <Input type="number" placeholder="4ª semana" registro={{ ...register('endWeek4') }} invalid={errors?.endWeek4?.message ? 'invalido' : ''} />
                        {errors?.endWeek4?.type && <InputError type={errors.endWeek4.type} field='endWeek4' />}
                        <Input type="number" placeholder="5ª semana" registro={{ ...register('endWeek5') }} invalid={errors?.endWeek5?.message ? 'invalido' : ''} />
                        {errors?.endWeek5?.type && <InputError type={errors.endWeek5.type} field='endWeek5' />}

                        <div className="font-semibold">
                            <span className="pr-2">Totais:</span>
                            <span>{endWeekTotal}</span>
                        </div>
                        <div className="font-semibold">
                            <span className="pr-2">Média:</span>
                            <span>{endWeekAverage}</span>
                        </div>
                    </div>
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 sm:my-[5%]`}>
                        <Button
                            size="lg"
                            disabled={disabled}
                            error={dataError}
                            success={dataSuccess}
                            type='submit'
                        >Enviar</Button>
                    </div>
                </div>
            </FormStyle >
        </section>
    )
}