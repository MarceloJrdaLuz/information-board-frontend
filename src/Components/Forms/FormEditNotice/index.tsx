import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Calendar from '@/Components/Calendar'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import TextArea from '@/Components/TextArea'
import { useAuthContext } from '@/context/AuthContext'
import { useFetch } from '@/hooks/useFetch'
import { useNotices } from '@/hooks/useNotices'
import { INotice } from '@/types/types'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import moment from 'moment'

export interface IUpdateNotice {
    notice_id: string
}

export default function FormEditNotice({ notice_id }: IUpdateNotice) {
    const { data } = useFetch<INotice>(`/notice/${notice_id}`)
    const { user } = useAuthContext()
    const { updateNotice, setExpiredNotice } = useNotices(user?.congregation.number ?? "")
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [initialExpired, setInitialExpired] = useState<string | null>(null)
    const [noticeUpdated, setNoticeUpdated] = useState<INotice | undefined>(data)
    const [recurrentNotice, setRecurrentNotice] = useState(Boolean(data?.startDay !== undefined && data?.endDay !== undefined))
    const [disabled, setDisabled] = useAtom(buttonDisabled)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)

    const formMethods = useForm<FormValues>({
        defaultValues: data || { // Set default values to the fetched data or empty values
            title: '',
            text: '',
            startDay: undefined,
            endDay: undefined
        },
    })

    const { register, reset, handleSubmit, formState: { errors }, setValue } = formMethods

    // Track the initial form values in state
    const [initialFormValues, setInitialFormValues] = useState<FormValues | null>(null)

    // Watch the form values for changes
    const watchedFormValues = formMethods.watch()

    const handleRecurrentNoticeChange = useCallback((isChecked: boolean) => {
        setRecurrentNotice(isChecked)
        // Limpe os valores e erros dos campos startDay e endDay quando o checkbox for desmarcado.
        if (!isChecked) {
            setValue('startDay', undefined)
            setValue('endDay', undefined)
            errors.startDay = undefined
            errors.endDay = undefined
        }
    }, [setValue, errors])


    useEffect(() => {
        if (data) {
            if (data.startDay && data.endDay) {
                handleRecurrentNoticeChange(true)
            }
            if (data.expired) {
                const initialDateStr = data.expired
                const initialDate = moment(initialDateStr).format()
                setSelectedDate(initialDate)
                setInitialExpired(initialDate)
            }
            setNoticeUpdated(data)
        }

        return () => {
            handleRecurrentNoticeChange(false)
        }
    }, [data, handleRecurrentNoticeChange])

    useEffect(() => {
        if (noticeUpdated) {
            reset({
                title: noticeUpdated.title || '',
                text: noticeUpdated.text || '',
                startDay: noticeUpdated.startDay || undefined,
                endDay: noticeUpdated.endDay || undefined,
            })
        }
    }, [noticeUpdated, reset])

    useEffect(() => {
        if (initialFormValues) {
            const isFormChanged = JSON.stringify(watchedFormValues) !== JSON.stringify(initialFormValues)
            const isDateChanged = initialExpired !== selectedDate
            const newDisabled = isFormChanged || isDateChanged
            setDisabled(!newDisabled)
        }
    }, [watchedFormValues, initialFormValues, setDisabled, selectedDate, initialExpired])

    const onSubmit = ({ title, text, startDay, endDay }: FormValues) => {
        toast.promise(updateNotice(notice_id, title, text, startDay, endDay), {
            pending: "Atualizando anúncio"
        }).then(() => {            
            reset()
            setRecurrentNotice(false)
        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    const handleDateChange = (date: string | null) => {
        setSelectedDate(date)
        setExpiredNotice(date)
    }

    useEffect(() => {
        if (data) {
            // Set initial form values when data is available
            setInitialFormValues({
                title: data.title || '',
                text: data.text || '',
                startDay: data.startDay || undefined,
                endDay: data.endDay || undefined,
            })
        }
    }, [data])

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar anúncio</div>

                    <Input type="text" placeholder="Título" registro={{
                        ...register('title', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                    <TextArea placeholder="Conteúdo" registro={{ ...register('text', { required: "Campo obrigatório" }) }} invalid={errors?.text?.message ? 'invalido' : ''} />
                    {errors?.text?.type && <InputError type={errors.text.type} field='text' />}

                    <CheckboxBoolean
                        checked={recurrentNotice}
                        label="Anúncio recorrente"
                        handleCheckboxChange={(isChecked) => handleRecurrentNoticeChange(isChecked)}
                    />

                    {recurrentNotice && (
                        <>
                            <Input type="number" placeholder="Dia inicial" registro={{
                                ...register('startDay', { required: "Campo obrigatório" })
                            }}
                                invalid={errors?.startDay?.message ? 'invalido' : ''} />
                            {errors?.startDay?.type && <InputError type={errors.startDay.type} field='startDay' />}

                            <Input type="number" placeholder="Dia final" registro={{
                                ...register('endDay', { required: "Campo obrigatório" })
                            }}
                                invalid={errors?.endDay?.message ? 'invalido' : ''} />
                            {errors?.endDay?.type && <InputError type={errors.endDay.type} field='endDay' />}
                        </>
                    )}

                    <Calendar label="Data da expiração:" minDate={moment().format()} handleDateChange={handleDateChange} selectedDate={selectedDate} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button className='text-typography-200' error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Atualizar Anúncio</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
