import { IconDelete } from "@/assets/icons"
import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import { usePermissionsAndRoles } from "@/hooks/usePermissionsAndRoles"
import { api } from "@/services/api"
import { PermissionType } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from 'yup'
import FormStyle from "../FormStyle"

export default function FormAddRole() {

    const { createRole } = usePermissionsAndRoles()
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


    const esquemaValidacao = yup.object({
        name: yup.string().required(),
        description: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: "",
            description: ""
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: { name: string, description: string }) {
        toast.promise(createRole(data.name, data.description, permissionSelectedsIds), {
            pending: "Criando nova permissão"
        }).then(() => {
            reset()
            setPermissionsSelected([])
        }).catch(err => {
            console.log(err)
        })
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
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Criar Função</div>

                    <Input type="text" placeholder="Nome da função" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Descrição da função" registro={{
                        ...register('description',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    <div className="mt-2">
                        <Dropdown textVisible full handleClick={option => handleClick(option)} options={optionsDrop ?? []} title="Permissões" border />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {permissionSelected && permissionSelected.map(permission => (
                            <span className='inline-flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-medium bg-surface-200 border border-surface-300 rounded-full text-typography-700 shadow-2xs' key={permission}>
                                {permission}
                                <button type="button" className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity ml-1 flex items-center" onClick={() => removePermissionSelected(permission)}>{IconDelete}</button>
                            </span>
                        ))}
                    </div>

                    <div className="w-full mt-6">
                        <Button className="w-full text-typography-200" success={dataSuccess} error={dataError} disabled={disabled} type='submit' >Criar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}