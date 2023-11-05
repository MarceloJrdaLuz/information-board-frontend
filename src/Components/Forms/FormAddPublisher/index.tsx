import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { usePublisherContext } from '@/context/PublisherContext'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import Button from '@/Components/Button'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Calendar from '@/Components/Calendar'
import { meses } from '@/functions/meses'
import { Gender, Hope, Privileges } from '@/entities/types'


export default function FormAddPublisher() {

    const { createPublisher } = usePublisherContext()
    const { user } = useAuthContext()
    const congregationUser = user?.congregation

    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [privilegesCheckboxSelected, setPrivilegesCheckboxSelected] = useState<string[]>([])
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')
    const [immersedDate, setImmersedDate] = useState<Date | null>(null)
    const [birthDate, setBirthDate] = useState<Date | null>(null)
    const [auxPioneerMonthsSelected, setAuxPioneerMonthsSelected] = useState<string[]>([])


    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

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
        setImmersedDate(date)
    }

    const handleAuxPioneerMonths = (selectedItems: string[]) => {
        setAuxPioneerMonthsSelected(selectedItems)
    }


    const optionsCheckboxGender = useState<string[]>(Object.values(Gender))

    const optionsCheckboxHope = useState(Object.values(Hope))

    const optionsCheckboxPrivileges = useState(Object.values(Privileges))

    const optionsPioneerMonths = useState(meses.map(month => `${month}-${new Date().getFullYear()}`))


    const getPrivilegeOptions = () => {
        if (genderCheckboxSelected === 'Feminino') {
            return ['Pioneiro Regular', 'Pioneiro Especial', 'Auxiliar Indeterminado']
        } else {
            return optionsCheckboxPrivileges[0] // Use default options for other genders
        }
    }

    const esquemaValidacao = yup.object({
        fullName: yup.string().required(),
        nickname: yup.string()
    })

    const { register, reset, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            fullName: '',
            nickname: ''
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        toast.promise(createPublisher(
            data.fullName,
            congregationUser?.id ?? "",
            genderCheckboxSelected,
            hopeCheckboxSelected,
            privilegesCheckboxSelected,
            data.nickname,
            immersedDate ?? undefined, 
            birthDate ?? undefined, 
            auxPioneerMonthsSelected
        ), {
            pending: 'Criando novo publicador',
        })
        reset()
        setGenderCheckboxSelected('')
        setPrivilegesCheckboxSelected([])
        setHopeCheckboxSelected('')
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Novo publicador</div>
                    <Input type="text" placeholder="Nome completo" registro={{
                        ...register('fullName',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.fullName?.message ? 'invalido' : ''} />
                    {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}
                    <Input type="text" placeholder="Apelido" registro={{ ...register('nickname', { required: "Campo obrigatório" }) }} invalid={errors?.nickname?.message ? 'invalido' : ''} />
                    {errors?.nickname?.type && <InputError type={errors.nickname.type} field='nickname' />}

                    <CheckboxUnique visibleLabel label="Gênero" options={optionsCheckboxGender[0]} handleCheckboxChange={(selectedItems) => handleCheckboxGender(selectedItems)} checked={genderCheckboxSelected} />

                    <CheckboxUnique visibleLabel label="Esperança" options={optionsCheckboxHope[0]} handleCheckboxChange={(selectedItems) => handleCheckboxHope(selectedItems)} checked={hopeCheckboxSelected} />

                    <CheckboxMultiple label='Privilégios' visibleLabel options={getPrivilegeOptions()} handleCheckboxChange={(selectedItems) => handleCheckboxPrivileges(selectedItems)} checkedOptions={privilegesCheckboxSelected} />

                    {privilegesCheckboxSelected.includes('Pioneiro Auxiliar') && <CheckboxMultiple checkedOptions={auxPioneerMonthsSelected} label='Meses Pioneiro Auxiliar' visibleLabel options={optionsPioneerMonths[0]} handleCheckboxChange={(selectedItems) => handleAuxPioneerMonths(selectedItems)} />}

                    <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handleBirthDateChange} selectedDate={birthDate} />

                    <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handleImmersedDateChange} selectedDate={immersedDate} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} disabled={(genderCheckboxSelected === '' || hopeCheckboxSelected === '') ? true : disabled} success={dataSuccess} type='submit'>Criar Publicador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}