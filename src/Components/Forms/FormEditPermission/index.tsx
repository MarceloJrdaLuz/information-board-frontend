import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm, FieldValues } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { IPermission } from '@/entities/types'
import { usePublisherContext } from '@/context/PublisherContext'
import { useFetch } from '@/hooks/useFetch'
import Router from 'next/router'
import { api } from '@/services/api'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'

export interface IUpdatePermission {
    permission_id: string
}

type SubmitHandler = (data: FormValues) => void

type CombinedValues = FieldValues & FormValues



export default function FormEditPermission({ permission_id }: IUpdatePermission) {

    const { updatePublisher } = usePublisherContext()
    const [permissionToUpdate, setPermissionToUpdate] = useState<IPermission>()

    const { data } = useFetch(`/permission/${permission_id}`)

    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [privilegesCheckboxSelected, setPrivilegesCheckboxSelected] = useState<string[]>([])
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')

    useEffect(() => {
        if (data) {
            setPermissionToUpdate(data)
        }
    }, [data])

    const esquemaValidacao = yup.object({
        name: yup.string(),
        description: yup.string()
    })


    const { register, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        if (permissionToUpdate) {
            reset({
                name: permissionToUpdate.name || '', // Set default values
                description: permissionToUpdate.description || '', // Set default values
            })
        }
    }, [permissionToUpdate, reset])

    async function updatePermission(permission_id: string, name?: string, description?: string) {
        await api.put(`/permission/${permission_id}`, {
            name,
            description
        }).then(res => {
            toast.success('Permissão atualizado com sucesso!')
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            toast.error('Ocorreu um erro no servidor!')
        })
    }

    const onSubmit = (data: FormValues) => {
        toast.promise(
            updatePermission(
                permission_id,
                data.name,
                data.description
            ),
            {
                pending: 'Atualizando permissão'
            })

        reset()
        Router.push('/permissoes')
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar permissão</div>

                    <Input type="text" placeholder="Nome" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Descrição" registro={{ ...register('description', { required: "Campo obrigatório" }) }} invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button type='submit'>Atualizar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}