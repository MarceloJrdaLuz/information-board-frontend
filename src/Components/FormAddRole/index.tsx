import FormStyle from "../FormStyle"
import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"
import { useContext, useEffect, useState } from "react"
import Input from "../Input"
import InputError from "../InputError"
import Button from "../Button"
import {  PermissionAndRolesContext } from "@/context/PermissionAndRolesContext"
import { PermissionType } from "@/entities/types"
import { api } from "@/services/api"
import Dropdown from "../Dropdown"
import { IconDelete } from "@/assets/icons"

export default function FormAddRole() {

    const { createRole } = useContext(PermissionAndRolesContext)
    const [permissions, setPermissions] = useState<PermissionType[]>([])
    const [optionsDrop, setOptionsDrop] = useState<string[]>()
    const [permissionSelected, setPermissionsSelected] = useState<string[]>([])
    const [permissionSelectedsIds, setPermissionSelectedsIds] = useState([''])

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


    const esquemaValidacao = yup.object({
        roleName: yup.string().required(),
        roleDescription: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            roleName: "",
            roleDescription: ""
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: { roleName: string, roleDescription: string }) {
        toast.promise(createRole( data.roleName, data.roleDescription, permissionSelectedsIds), {
            pending: "Criando nova permissão"
        })  
        reset()
        setPermissionsSelected([])
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleClick(option: string) {
        setPermissionsSelected([...permissionSelected, option])
        const optionsDropFilter = permissions.filter(permission => permission.name !== option)
        setPermissions(optionsDropFilter)
    }

    function removePermissionSelected(permissionRemove: string) {
        const permissionFilter = permissionSelected.filter(permissionSelected => permissionSelected !== permissionRemove)
        setPermissionsSelected(permissionFilter)
    }


    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Criar Função</div>

                    <Input type="text" placeholder="Nome da função" registro={{
                        ...register('roleName',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.roleName?.message ? 'invalido' : ''} />
                    {errors?.roleName?.type && <InputError type={errors.roleName.type} field='roleName' />}

                    <Input type="text" placeholder="Descrição da função" registro={{
                        ...register('roleDescription',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.roleDescription?.message ? 'invalido' : ''} />
                    {errors?.roleDescription?.type && <InputError type={errors.roleDescription.type} field='roleDescription' />}

                    <Dropdown textVisible handleClick={option => handleClick(option)} options={optionsDrop ?? []} title="Permissões" border />
                    <div className="mt-4 flex flex-wrap">
                        {permissionSelected && permissionSelected.map(permission => <span className='flex justify-center items-center py-2 px-5 text-xs bg-gray-300 rounded-3xl m-1 w-fit' key={permission} >
                            {permission}
                            <span className="py-2 ml-2  flex justify-center items-center" onClick={() => removePermissionSelected(permission)}>{IconDelete}</span>
                        </span>)}
                    </div>

                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Criar permissão' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}