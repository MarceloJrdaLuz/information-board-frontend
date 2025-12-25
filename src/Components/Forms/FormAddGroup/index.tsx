import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Dropdown from '@/Components/Dropdown'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useAuthContext } from '@/context/AuthContext'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { useSubmit } from '@/hooks/useSubmitForms'
import { api } from '@/services/api'
import { IPublisher } from '@/types/types'
import { messageErrorsSubmit, messageSuccessSubmit } from '@/utils/messagesSubmit'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { API_ROUTES } from '@/constants/apiRoutes'

export interface IGroup {
    id: string
    name: string
    number: string
}

export default function FormAddGroup() {
    const { user } = useAuthContext()
    const congregationUser = user?.congregation

    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
    const [selectedNumber, setSelectedNumber] = useState<string>()
    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedItem, setSelectedItem] = useState<IPublisher | null>(null)

    const fetchConfig = congregationUser ? `/groups/${congregationUser.id}` : ""
    const { data } = useFetch<IGroup[]>(fetchConfig)

    const fetchPublisherDataConfig = congregationUser ? `${API_ROUTES.PUBLISHERS}/congregationId/${congregationUser?.id}` : ''
    const { data: publishersData, mutate } = useFetch<IPublisher[]>(fetchPublisherDataConfig)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        if (data) {
            const existingNumbers = data.map(group => group.number)
            const allNumbers = Array.from({ length: 15 }, (_, index) => (index + 1).toString())
            const availableNumbers = allNumbers.filter(number => !existingNumbers.includes(number))
            setAvailableNumbers(availableNumbers)
        }
    }, [data])

    useEffect(() => {
        if (publishersData) {
            const filterPublishersMale = publishersData.filter(publisher => (publisher.gender === 'Masculino'))
            const sort = sortArrayByProperty(filterPublishersMale, "fullName")
            setPublishers(sort)
        }
    }, [publishersData])

    const esquemaValidacao = yup.object({
        name: yup.string().required(),
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '',
        }, resolver: yupResolver(esquemaValidacao)
    })

    async function createGroup(name: string, number: string, publisher_id: string, congregation_id: string) {
        await api.post('group', {
            name,
            number,
            publisher_id,
            congregation_id
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.groupCreate)
            reset()
            setSelectedNumber('')
            setSelectedItem(null)
            mutate()
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === 'The publisher is already a group overseer for another group') {
                handleSubmitError(messageErrorsSubmit.publisherAlreadyOverseer)
            } else {
                console.log(message)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    function onSubmit(data: { name: string }) {
        if (selectedNumber && selectedItem && congregationUser?.id) {
            toast.promise(createGroup(data.name, selectedNumber, selectedItem?.id, congregationUser.id), {
                pending: 'Criando grupo...',
            }).then(() => {

            }).catch(err => {
                console.log(err)
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
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Dropdown selectedItem={selectedNumber} full border textVisible handleClick={option => handleClick(option)} title='Número do grupo' options={availableNumbers} />

                    <div className='mt-2'>
                        {publishers && (
                            <DropdownObject<IPublisher>
                                title="Dirigente do grupo"
                                items={publishers}
                                selectedItem={selectedItem}
                                handleChange={setSelectedItem}
                                labelKey="fullName"
                                border
                                textVisible
                                full                        
                                searchable
                            />
                        )}
                    </div>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 mt-[10%]`}>
                        <Button className='text-typography-200' success={dataSuccess} error={dataError} disabled={(!selectedNumber || !selectedItem || disabled)} type='submit' >Criar Grupo</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}