import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm, FieldValues, useWatch } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { INotice, IPermission } from '@/entities/types'
import { usePublisherContext } from '@/context/PublisherContext'
import { useFetch } from '@/hooks/useFetch'
import Router from 'next/router'
import { api } from '@/services/api'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'
import { useNoticesContext } from '@/context/NoticeContext'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import Calendar from '@/Components/Calendar'
import { useAtom } from 'jotai'
import { buttonDisabled } from '@/atoms/atom'
import { isEqual } from 'lodash'

export interface IUpdateNotice {
    notice_id: string
}

type SubmitHandler = (data: FormValues) => void

type CombinedValues = FieldValues & FormValues

export default function FormEditNotice({ notice_id }: IUpdateNotice) {
    const { data } = useFetch<INotice>(`/notice/${notice_id}`);

    const { updateNotice, setExpiredNotice } = useNoticesContext();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const [noticeUpdated, setNoticeUpdated] = useState<INotice>();
    const [recurrentNotice, setRecurrentNotice] = useState(false);
    const [disabled, setDisabled] = useAtom(buttonDisabled);

    const formMethods = useForm<FormValues>({
        defaultValues: { // Manually set default values here
            title: '',
            text: '',
            startDay: undefined,
            endDay: undefined,
        },
    });

    const { register, reset, handleSubmit, formState: { errors } } = formMethods;

    // Create a ref to track the initial form values
    const initialFormValues = useRef<FormValues | null>(null);

    // Watch the form values for changes
    const watchedFormValues = useWatch({ control: formMethods.control });

    useEffect(() => {
        if (data) {
            setNoticeUpdated(data);
            if (data.startDay && data.endDay) {
                setRecurrentNotice(true);
            }

            if (!initialFormValues.current) {
                // Set initial form values when data is available and when initialFormValues is not set yet
                initialFormValues.current = {
                    title: data.title || '',
                    text: data.text || '',
                    startDay: data.startDay || undefined,
                    endDay: data.endDay || undefined,
                };
                // Set default values manually here
                formMethods.reset(initialFormValues.current);
            }
        }
    }, [data, formMethods]);

    useEffect(() => {
        if (noticeUpdated) {
            reset({
                title: noticeUpdated.title || '',
                text: noticeUpdated.text || '',
                startDay: noticeUpdated.startDay || undefined,
                endDay: noticeUpdated.endDay || undefined,
            });
        }
    }, [noticeUpdated, reset]);

    useEffect(() => {
        if (initialFormValues.current) {
            const isFormChanged = JSON.stringify(watchedFormValues) !== JSON.stringify(initialFormValues.current);
            setDisabled(!isFormChanged);
        }
    }, [watchedFormValues, initialFormValues, setDisabled]);

    const onSubmit = ({title, text, startDay, endDay}: FormValues) => {
        toast.promise(updateNotice(notice_id ,title, text, startDay, endDay), {
            pending: "Atualizando anúncio"
        })
        reset()
        setRecurrentNotice(false)
    };

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.');
    }


    const handleDateChange = (date: Date) => {
        setSelectedDate(date)
        setExpiredNotice(date)
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar anúncio</div>

                    <Input type="text" placeholder="Título" registro={{
                        ...register('title',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                    <Input type="text" placeholder="Conteúdo" registro={{ ...register('text', { required: "Campo obrigatório" }) }} invalid={errors?.text?.message ? 'invalido' : ''} />
                    {errors?.text?.type && <InputError type={errors.text.type} field='text' />}

                    <CheckboxBoolean
                        checked={recurrentNotice}
                        label="Anúncio recorrente"
                        handleCheckboxChange={(isChecked) => {
                            setRecurrentNotice(!recurrentNotice)
                        }}
                    />

                    {recurrentNotice && (
                        <>
                            <Input type="number" placeholder="Dia inicial" registro={{
                                ...register('startDay',
                                    { required: "Campo obrigatório" })
                            }}
                                invalid={errors?.startDay?.message ? 'invalido' : ''} />
                            {errors?.startDay?.type && <InputError type={errors.startDay.type} field='startDay' />}

                            <Input type="number" placeholder="Dia final" registro={{
                                ...register('endDay',
                                    { required: "Campo obrigatório" })
                            }}
                                invalid={errors?.endDay?.message ? 'invalido' : ''} />
                            {errors?.endDay?.type && <InputError type={errors.endDay.type} field='endDay' />}
                        </>
                    )}

                    <Calendar handleDateChange={handleDateChange} selectedDate={selectedDate}/>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button disabled={disabled} type='submit'>Atualizar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}