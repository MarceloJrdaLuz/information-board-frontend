import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm, FieldValues, useWatch } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { ICategory } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import Router from 'next/router'
import { api } from '@/services/api'
import { IconDelete } from '@/assets/icons'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Dropdown from '@/Components/Dropdown'
import Button from '@/Components/Button'
import { useAtom, useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { useSubmitContext } from '@/context/SubmitFormContext'

export interface IUpdateCategory {
    category_id: string
}

type SubmitHandler = (data: FormValues) => void

type CombinedValues = FieldValues & FormValues

export default function FormEditCategory({ category_id }: IUpdateCategory) {
    const { data } = useFetch<ICategory>(`/category/${category_id}`)
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const [categoryToUpdate, setCategoryToUpdate] = useState<ICategory>()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)


    const formMethods = useForm<FormValues>({
        defaultValues: { // Manually set default values here
            name: '',
            description: ''
        },
    });

    const esquemaValidacao = yup.object({
        name: yup.string(),
        description: yup.string()
    })

    // Create a ref to track the initial form values
    const initialFormValues = useRef<FormValues | null>(null);

    // Watch the form values for changes
    const watchedFormValues = useWatch({ control: formMethods.control });


    const { register, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        if (data) {
            setCategoryToUpdate(data)

            if (!initialFormValues.current) {
                // Set initial form values when data is available and when initialFormValues is not set yet
                initialFormValues.current = {
                    name: data.name || '',
                    description: data.description || '',

                };
                // Set default values manually here
                formMethods.reset(initialFormValues.current);
            }
        }
    }, [data, formMethods]);

    useEffect(() => {
        if (categoryToUpdate) {
            reset({
                name: categoryToUpdate.name || '',
                description: categoryToUpdate.description || '',
            });
        }
    }, [categoryToUpdate, reset]);

    useEffect(() => {
        if (initialFormValues.current) {
            const isFormChanged = JSON.stringify(watchedFormValues) !== JSON.stringify(initialFormValues.current)
        }
    }, [watchedFormValues, initialFormValues]);

    async function updateCategory(category_id: string, name?: string, description?: string) {
        await api.put(`/category/${category_id}`, {
            name,
            description
        }).then(res => {
            toast.success('Permissão atualizado com sucesso!')
            handleSubmitSuccess()
            setTimeout(() => {
                Router.push('/categorias')
            }, 6000)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
            handleSubmitError()
        })
    }

    const onSubmit = (data: FormValues) => {
        toast.promise(
            updateCategory(
                category_id,
                data.name,
                data.description
            ),
            {
                pending: 'Atualizando permissão'
            })
    }
    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar categoria</div>

                    <Input type="text" placeholder="Título" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Descrição" registro={{
                        ...register('description',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 mt-[10%]`}>
                        <Button disabled={disabled} success={dataSuccess} error={dataError} type='submit'>Atualizar Categoria</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}