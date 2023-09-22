import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import Input from '../Input'
import InputError from '../InputError'
import Button from '../Button'
import { useForm } from 'react-hook-form'
import { useContext, useEffect, useState } from 'react'
import { api } from '@/services/api'
import { ICategory, IPublisher } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import { AuthContext } from '@/context/AuthContext'
import Dropdown from '../Dropdown'
import { IBodyCreateGroup } from './types'
import DropdownObject from '../DropdownObjects'

export interface IGroup {
    id: string
    name: string
    number: string
}

export default function FormAddGroup() {
    const { user } = useContext(AuthContext)
    const congregationUser = user?.congregation

    const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
    const [selectedNumber, setSelectedNumber] = useState<string>()
    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedItem, setSelectedItem] = useState<IPublisher | null>(null)

    const fetchConfig = congregationUser ? `/groups/${congregationUser.id}` : ""
    const { data } = useFetch<IGroup[]>(fetchConfig)

    const fetchPublisherDataConfig = congregationUser ? `/publishers/congregationId/${congregationUser?.id}` : ''
    const { data: publishersData, mutate } = useFetch<IPublisher[]>(fetchPublisherDataConfig)


    useEffect(() => {
        if (data) {
            const existingNumbers = data.map(group => group.number);
            const allNumbers = Array.from({ length: 15 }, (_, index) => (index + 1).toString());
            const availableNumbers = allNumbers.filter(number => !existingNumbers.includes(number));
            setAvailableNumbers(availableNumbers);
        }
    }, [data])

    useEffect(() => {
        setPublishers(publishersData)
    }, [publishersData])

    const esquemaValidacao = yup.object({
        groupName: yup.string().required(),
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            groupName: '',
        }, resolver: yupResolver(esquemaValidacao)
    })

    async function createGroup(name: string, number: string, publisher_id: string, congregation_id: string) {
        await api.post('group', {
            name,
            number,
            publisher_id,
            congregation_id
        }).then(res => {
            toast.success("Grupo criado com sucesso!")
            reset()
            setSelectedNumber('')
            setSelectedItem(null)
            mutate()
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === 'The publisher is already a group overseer for another group') {
                toast.error('Publicador já é dirigente de outro grupo!')
            } else {
                console.log(message)
                toast.error('Ocorreu um erro no servidor!')
            }
        })
    }

    function onSubmit(data: { groupName: string }) {
        if (selectedNumber && selectedItem && congregationUser?.id) {
            toast.promise(createGroup(data.groupName, selectedNumber, selectedItem?.id, congregationUser.id), {
                pending: 'Criando grupo...',
            })
        }
    }

    function handleClick(number: string) {
        setSelectedNumber(number)
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2 ">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>

                    <div className={`my-6  w-11/12 font-semibold  sm:text-2xl text-primary-200`}>Criar novo grupo</div>

                    <Input type="text" placeholder="Nome do grupo" registro={{
                        ...register('groupName',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.groupName?.message ? 'invalido' : ''} />
                    {errors?.groupName?.type && <InputError type={errors.groupName.type} field='groupName' />}

                    <Dropdown selectedItem={selectedNumber} textAlign='left' full border textVisible handleClick={option => handleClick(option)} title='Número do grupo' options={availableNumbers} />

                    <div className='mt-2'>
                        {publishers && (
                            <DropdownObject<IPublisher>
                                title="Dirigente do grupo"
                                items={publishers}
                                selectedItem={selectedItem}
                                handleChange={setSelectedItem}
                                labelKey="fullName"
                                border
                                full
                                textAlign='left'
                            />
                        )}
                    </div>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 mt-[10%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Criar grupo' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}