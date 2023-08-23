import FormStyle from "../FormStyle"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useContext, useEffect, useState } from "react"
import Button from "../Button"
import { PermissionAndRolesContext } from "@/context/PermissionAndRolesContext"
import {RolesType, UserTypes } from "@/entities/types"
import { api } from "@/services/api"
import Dropdown from "../Dropdown"
import { IconDelete } from "@/assets/icons"

export default function FormUserRoles() {

    const { userRoles } = useContext(PermissionAndRolesContext)
    const [roles, setRoles] = useState<RolesType[]>([])
    const [users, setUsers] = useState<{ id: string, email: string }[]>([])
    const [userSelected, setUserSelected] = useState('')
    const [userSelectedId, setUserSelectedId] = useState('')

    const [optionsDrop, setOptionsDrop] = useState<string[]>()
    const [optionsDropUsers, setOptionsDropUsers] = useState<string[]>()
    const [rolesSelecteds, setRolesSelected] = useState<string[]>([])
    const [rolesSelectedsIds, setRolesSelectedsIds] = useState([''])

    useEffect(() => {
        setOptionsDrop(roles?.map(role => `${role.name}`))
    }, [roles])

    useEffect(() => {
        setOptionsDropUsers(users?.map(user => `${user.email}`))
    }, [users])


    useEffect(() => {
        const getUsers = async () => {
            await api.get<{ id: string, email: string }[]>('/users').then(res => {
                const { data } = res

                const optionsUsers: UserTypes[] = []

                data.map(user => {
                    optionsUsers.push({ ...user })
                })

                if (userSelected === '') {
                    setUsers(optionsUsers)
                } else {
                    const optionsUsersFilter = optionsUsers.filter(optionUser => userSelected === optionUser.email)
                    setUserSelectedId(optionsUsersFilter[0].id)
                    setUsers(optionsUsersFilter)
                }
            })
        }
        getUsers()
    }, [userSelected])


    useEffect(() => {
        const getRoles = async () => {
            await api.get<RolesType[]>('/roles').then(res => {
                const { data } = res
                // setCongregations([...data])
                const optionsRoles: RolesType[] = []
                data.map(role => {
                    optionsRoles.push({ ...role })
                })
                const optionsRolesFilterSelected = optionsRoles.filter(optionRole => rolesSelecteds.includes(optionRole.name))


                setRolesSelectedsIds(optionsRolesFilterSelected.map(role => `${role.id}`))

                const optionsRolesFilter = optionsRoles.filter(optionRole => !rolesSelecteds.includes(optionRole.name))
                setRoles(optionsRolesFilter)

            }).catch(err => console.log(err))
        }
        getRoles()
    }, [rolesSelecteds])


    const { register, handleSubmit, formState: { errors }, reset } = useForm({

    })

    function onSubmit() {
        toast.promise(userRoles(userSelectedId, rolesSelectedsIds), {
            pending: "Criando nova permissão"
        })
        reset()
        setUserSelected("")
        setRolesSelected([])
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleClickRolesDrop(option: string) {
        setRolesSelected([...rolesSelecteds, option])
        const optionsDropFilter = roles.filter(role => role.name !== option)
        setRoles(optionsDropFilter)
    }

    function handleClickUserDrop(option: string) {
        setUserSelected(option)
    }

    function removerRolesSelecteds(roleRemove: string) {
        const rolesFilter = rolesSelecteds.filter(rolesSelecteds => rolesSelecteds !== roleRemove)
        setRolesSelected(rolesFilter)
    }


    return (
        <section className="flex justify-center items-center h-full">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Atribuir função a um usuário</div>

                    {/* <Input type="text" placeholder="Nome da role" registro={{
                        ...register('userId',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.userId?.message ? 'invalido' : ''} />
                    {errors?.userId?.type && <InputError type={errors.userId.type} field='userId' />} */}


                    <Dropdown handleClick={option => handleClickUserDrop(option)} options={optionsDropUsers ?? []} title="Usuários" border />
                    <div className="my-4 flex flex-wrap">
                        {userSelected && <span className='flex justify-center items-center py-2 px-5 text-xs bg-gray-300 rounded-3xl m-1 w-fit' key={userSelected} >
                            {userSelected}
                            <span className="py-2 ml-2  flex justify-center items-center" onClick={() => setUserSelected("")}>{IconDelete}</span>
                        </span>}
                    </div>

                    <div>
                        <Dropdown handleClick={option => handleClickRolesDrop(option)} options={optionsDrop ?? []} title="Funções" border />
                        <div className="mt-4 flex flex-wrap">
                            {rolesSelecteds && rolesSelecteds.map(permission => <span className='flex justify-center items-center py-2 px-5 text-xs bg-gray-300 rounded-3xl m-1 w-fit' key={permission} >
                                {permission}
                                <span className="py-2 ml-2  flex justify-center items-center" onClick={() => removerRolesSelecteds(permission)}>{IconDelete}</span>
                            </span>)}
                        </div>
                    </div>

                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Criar permissão' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}