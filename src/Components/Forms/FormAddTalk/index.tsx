import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import TalksBoard from '@/Components/TalksBoard'
import { ICongregation, IPublisher, ITalk } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import { createTalkAtom } from '@/atoms/talksAtoms'


export default function FormAddTalk() {
    const createTalk = useSetAtom(createTalkAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const schemaValidation = yup.object({
        number: yup.number().required(),
        title: yup.string().required(),
    })


    const { register, reset, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: {
            number: 1,
            title: ''
        },
        resolver: yupResolver(schemaValidation)
    })

    function onSubmit(data: FormValues) {
        console.log(data)
        toast.promise(createTalk({
            number: data.number,
            title: data.title
        }), {
            pending: 'Criando novo discurso...',
        })
        reset()
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Novo discurso</div>

                    <>
                        <Input type="number" placeholder="Número" registro={{
                            ...register('number',
                                { required: "Campo obrigatório" })
                        }}
                            invalid={errors?.number?.message ? 'invalido' : ''} />
                        {errors?.number?.type && <InputError type={errors.number.type} field='number' />}

                        <Input type="text" placeholder="Tema" registro={{ ...register('title') }} invalid={errors?.title?.message ? 'invalido' : ''} />
                        {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                        <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                            <Button error={dataError} disabled={disabled} success={dataSuccess} type='submit'>Criar discurso</Button>
                        </div>
                    </>
                </div>
            </FormStyle>
        </section>
    )
}