import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm} from 'react-hook-form'
import { useEffect, useState } from 'react'
import { PermissionType, RolesType } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import { IconDelete } from '@/assets/icons'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Dropdown from '@/Components/Dropdown'
import Button from '@/Components/Button'
import { usePermissionsAndRolesContext } from '@/context/PermissionAndRolesContext'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'

export interface IUpdateRole {
    role_id: string
}

export default function FormEditRole({ role_id }: IUpdateRole) {

    const {updateRole} = usePermissionsAndRolesContext()
    const [roleToUpdate, setRoleToUpdate] = useState<RolesType>()
    const [permissions, setPermissions] = useState<PermissionType[]>([])
    const [optionsDrop, setOptionsDrop] = useState<string[]>()
    const [permissionSelected, setPermissionsSelected] = useState<string[]>([])
    const [permissionSelectedsIds, setPermissionSelectedsIds] = useState([''])

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        setOptionsDrop(permissions?.map(permission => `${permission.name}`))
    }, [permissions])

    useEffect(() => {
        const getPermissions = async () => {
            await api.get<PermissionType[]>('/permission').then(res => {
                const { data } = res
                // setCongregations([...data])
                const optionsPermissions: PermissionType[] = []
                data.map(permission => {
                    optionsPermissions.push({ ...permission })
                })
                const optionsPermissionFilterSelected = optionsPermissions.filter(optionPermission => permissionSelected.includes(optionPermission.name))


                setPermissionSelectedsIds(optionsPermissionFilterSelected.map(permission => `${permission.id}`))

                const optionsPermissionFilter = optionsPermissions.filter(optionPermission => !permissionSelected.includes(optionPermission.name))
                setPermissions(optionsPermissionFilter)

            }).catch(err => console.log(err))
        }
        getPermissions()
    }, [permissionSelected])


    const { data } = useFetch<RolesType>(`/role/${role_id}`)


    useEffect(() => {
        if (data) {
            setRoleToUpdate(data)
            if (data.permissions.length > 0) {
                const actualPermissions = data.permissions.map(permission => (
                    permission.name
                ))

                setPermissionsSelected(actualPermissions)
            }
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
        if (roleToUpdate) {
            reset({
                name: roleToUpdate.name || '', // Set default values
                description: roleToUpdate.description || '', // Set default values
            })
        }
    }, [roleToUpdate, reset])

    function handleClick(option: string) {
        setPermissionsSelected([...permissionSelected, option])
        const optionsDropFilter = permissions.filter(permission => permission.name !== option)
        setPermissions(optionsDropFilter)
    }

    function removePermissionSelected(permissionRemove: string) {
        const permissionFilter = permissionSelected.filter(permissionSelected => permissionSelected !== permissionRemove)
        setPermissionsSelected(permissionFilter)
    }


    

    const onSubmit = (data: FormValues) => {
        toast.promise(
            updateRole(
                role_id,
                data.name,
                data.description,
                permissionSelectedsIds
            ),
            {
                pending: 'Atualizando permissão'
            })
        reset()
        setPermissionsSelected([])
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar função</div>

                    <Input type="text" placeholder="Nome" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Descrição" registro={{ ...register('description', { required: "Campo obrigatório" }) }} invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    <Dropdown textVisible handleClick={option => handleClick(option)} options={optionsDrop ?? []} title="Permissões" border />
                    <div className="mt-4 flex flex-wrap">
                        {permissionSelected && permissionSelected.map(permission => <span className='flex justify-center items-center py-2 px-5 text-xs bg-gray-300 rounded-3xl m-1 w-fit' key={permission} >
                            {permission}
                            <span className="py-2 ml-2  flex justify-center items-center" onClick={() => removePermissionSelected(permission)}>{IconDelete}</span>
                        </span>)}
                    </div>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Atualizar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}