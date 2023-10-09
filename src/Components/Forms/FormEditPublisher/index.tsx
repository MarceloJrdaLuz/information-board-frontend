import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { IPublisher } from '@/entities/types'
import { usePublisherContext } from '@/context/PublisherContext'
import { useFetch } from '@/hooks/useFetch'
import Router from 'next/router'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import InputError from '@/Components/InputError'
import Input from '@/Components/Input'
import Button from '@/Components/Button'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Calendar from '@/Components/Calendar'
import moment from 'moment'

export interface IUpdatePublisher {
    id: string
}

export default function FormEditPublisher(props: IUpdatePublisher) {

    const { updatePublisher } = usePublisherContext()
    const [publisherToUpdate, setPublisherToUpdate] = useState<IPublisher>()

    const { data } = useFetch<IPublisher>(`/publisher/${props.id}`)

    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [privilegesCheckboxSelected, setPrivilegesCheckboxSelected] = useState<string[]>([])
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')
    const [immersedDate, setImmersedDate] = useState<Date | null>(null)
    const [birthDate, setBirthDate] = useState<Date | null>(null)


    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        if (data) {
            setPublisherToUpdate(data)
            setGenderCheckboxSelected(data.gender || '') // Set the gender checkbox
            setPrivilegesCheckboxSelected(data.privileges || []) // Set the privileges checkboxes
            setHopeCheckboxSelected(data.hope || '')
            if (data.birthDate) {
                const initialDateStr = data.birthDate;
                const initialDate = new Date(initialDateStr)
                setBirthDate(initialDate)
            }
            if (data.dateImmersed) {
                const initialDateStr = data.dateImmersed;
                const initialDate = new Date(initialDateStr)
                setImmersedDate(initialDate)
            }
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

    const handleBirthDateChange = (date: Date) => {
        setBirthDate(date)
    }

    const handleImmersedDateChange = (date: Date) => {
        console.log(date)
        setImmersedDate(date)
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

    const getPrivilegeOptions = () => {
        if (genderCheckboxSelected === 'Feminino') {
            return ['Pioneiro Regular', 'Pioneiro Especial', 'Auxiliar Indeterminado'];
        } else {
            return optionsCheckboxPrivileges[0]; // Use default options for other genders
        }
    }

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
                data.nickname,
                immersedDate ?? undefined,
                birthDate ?? undefined
            ),
            {
                pending: 'Atualizando publicador',
            }
        )
        reset()
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
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

                    <CheckboxUnique visibleLabel checked={genderCheckboxSelected} label="Gênero" options={optionsCheckboxGender[0]} handleCheckboxChange={(selectedItems) => handleCheckboxGender(selectedItems)} />

                    <CheckboxUnique visibleLabel checked={hopeCheckboxSelected} label="Esperança" options={optionsCheckboxHope[0]} handleCheckboxChange={(selectedItems) => handleCheckboxHope(selectedItems)} />

                    <CheckboxMultiple checkedOptions={privilegesCheckboxSelected} label='Privilégios' visibleLabel options={getPrivilegeOptions()} handleCheckboxChange={(selectedItems) => handleCheckboxPrivileges(selectedItems)} />

                    <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handleImmersedDateChange} selectedDate={immersedDate} />

                    <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handleBirthDateChange} selectedDate={birthDate} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} success={dataSuccess} disabled={disabled} type='submit' >Atualizar publicador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}