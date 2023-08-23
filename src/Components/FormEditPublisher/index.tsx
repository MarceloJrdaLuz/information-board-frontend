import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import Input from '../Input'
import InputError from '../InputError'
import Button from '../Button'
import { useForm, FieldValues } from 'react-hook-form'
import { useContext, useEffect, useState } from 'react'
import { IPublisher } from '@/entities/types'
import { PublisherContext } from '@/context/PublisherContext'
import { useFetch } from '@/hooks/useFetch'
import CheckboxMultiple from '../CheckBoxMultiple'
import CheckboxUnique from '../CheckBoxUnique'
import Router from 'next/router'

export interface IUpdatePublisher {
    id: string
}

type SubmitHandler = (data: FormValues) => void

type CombinedValues = FieldValues & FormValues



export default function FormEditPublisher(props: IUpdatePublisher) {

    const { updatePublisher } = useContext(PublisherContext)
    const [publisherToUpdate, setPublisherToUpdate] = useState<IPublisher>()

    const { data } = useFetch(`/publisher/${props.id}`)

    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [privilegesCheckboxSelected, setPrivilegesCheckboxSelected] = useState<string[]>([])
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')

    useEffect(() => {
        if (data) {
            setPublisherToUpdate(data)
            setGenderCheckboxSelected(data.gender || '') // Set the gender checkbox
            setPrivilegesCheckboxSelected(data.privileges || []) // Set the privileges checkboxes
            setHopeCheckboxSelected(data.hope || '') // Set the hope checkbox
        }
    }, [data])


    const handleCheckboxGender = (selectedItems: string) => {
        setGenderCheckboxSelected(selectedItems)
    }

    const handleCheckboxHope = (selectedItems: string) => {
        setHopeCheckboxSelected(selectedItems)
    }

    const handleCheckboxPrivileges = (selectedItems: string[]) => {
        setPrivilegesCheckboxSelected(selectedItems)
    }

    const optionsCheckboxGender = useState<string[]>([
        'Masculino',
        'Feminino'
    ])
    const optionsCheckboxHope = useState([
        'Ungido',
        'Outras ovelhas'
    ])

    const optionsCheckboxPrivileges = useState([
        'Ancião',
        'Servo Ministerial',
        'Pioneiro Auxiliar',
        'Pioneiro Regular',
        'Pioneiro Especial',
        'Auxiliar Indeterminado'
    ])

    const esquemaValidacao = yup.object({
        fullName: yup.string().required(),
        nickname: yup.string()
    })


    const { register, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        if (publisherToUpdate) {
            reset({
                fullName: publisherToUpdate.fullName || '', // Set default values
                nickname: publisherToUpdate.nickname || '', // Set default values
            })
        }
    }, [publisherToUpdate, reset])

    const onSubmit = (data: FormValues) => {
        toast.promise(
            updatePublisher(
                props.id,
                data.fullName,
                publisherToUpdate?.congregation?.id ?? '',
                genderCheckboxSelected,
                hopeCheckboxSelected,
                privilegesCheckboxSelected,
                data.nickname
            ),
            {
                pending: 'Atualizando publicador',
            }
        )
        reset()
        Router.push('/publicadores')
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex  justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar publicador</div>
                    <Input type="text" placeholder="Nome completo" registro={{
                        ...register('fullName',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.fullName?.message ? 'invalido' : ''} />
                    {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}
                    <Input type="text" placeholder="Apelido" registro={{ ...register('nickname', { required: "Campo obrigatório" }) }} invalid={errors?.nickname?.message ? 'invalido' : ''} />
                    {errors?.nickname?.type && <InputError type={errors.nickname.type} field='nickname' />}

                    <CheckboxMultiple checkedOptions={privilegesCheckboxSelected} label='Privilégios' visibleLabel options={optionsCheckboxPrivileges[0]} handleCheckboxChange={(selectedItems) => handleCheckboxPrivileges(selectedItems)} />

                    <CheckboxUnique checked={genderCheckboxSelected} label="Genero" options={optionsCheckboxGender[0]} handleCheckboxChange={(selectedItems) => handleCheckboxGender(selectedItems)} />

                    <CheckboxUnique checked={hopeCheckboxSelected} label="Esperança" options={optionsCheckboxHope[0]} handleCheckboxChange={(selectedItems) => handleCheckboxHope(selectedItems)} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Atualizar publicador' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}