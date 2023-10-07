import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm, FieldValues } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { IPermission } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { usePermissionsAndRolesContext } from '@/context/PermissionAndRolesContext'

export interface IUpdatePermission {
    permission_id: string
}

export default function FormEditPermission({ permission_id }: IUpdatePermission) {

    const {updatePermission} = usePermissionsAndRolesContext()
    const [permissionToUpdate, setPermissionToUpdate] = useState<IPermission>()

    const { data } = useFetch(`/permission/${permission_id}`)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)


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
                        <Button success={dataSuccess} error={dataError} disabled={disabled} type='submit'>Atualizar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}