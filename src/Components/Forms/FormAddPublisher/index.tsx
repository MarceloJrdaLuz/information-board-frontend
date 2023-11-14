import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
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
import { Gender, Hope, Privileges, Situation } from '@/entities/types'


export default function FormAddPublisher() {

    const { createPublisher } = usePublisherContext()
    const { user } = useAuthContext()
    const congregationUser = user?.congregation

    const [situationPublisherCheckboxSelected, setSituationPublisherCheckboxSelected] = useState<string>('')
    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')
    const [immersedDate, setImmersedDate] = useState<Date | null>(null)
    const [birthDate, setBirthDate] = useState<Date | null>(null)
    const [auxPioneerMonthsSelected, setAuxPioneerMonthsSelected] = useState<string[]>([])
    const [privilegeCheckboxSelected, setPrivilegeCheckboxSelected] = useState('')
    const [pioneerCheckboxSelected, setPioneerCheckboxSelected] = useState('')
    const [startPioneer, setStartPioneer] = useState<Date | null>(null)
    const [allPrivileges, setAllPrivileges] = useState<string[]>([])

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const optionsCheckboxSituationPublisher = useState(Object.values(Situation))

    const optionsCheckboxPrivileges = [`${Privileges.ANCIAO}`, `${Privileges.SM}`]

    const optionsCheckboxPioneer = [`${Privileges.PIONEIROAUXILIAR}`, `${Privileges.AUXILIARINDETERMINADO}`, `${Privileges.MISSIONARIOEMCAMPO}`, `${Privileges.PIONEIROESPECIAL}`, `${Privileges.PIONEIROREGULAR}`]

    const optionsCheckboxGender = useState<string[]>(Object.values(Gender))

    const optionsCheckboxHope = useState(Object.values(Hope))

    const optionsPioneerMonths = useState(meses.map(month => `${month}-${new Date().getFullYear()}`))

    const handleCheckboxGender = (selectedItems: string) => {
        setGenderCheckboxSelected(selectedItems)
    }

    const handleCheckboxHope = (selectedItems: string) => {
        setHopeCheckboxSelected(selectedItems)
    }

    const handleCheckboxPrivileges = (selectedItem: string) => {
        setPrivilegeCheckboxSelected(selectedItem)
    }

    const handleCheckboxPioneer = (selectedItem: string) => {
        setPioneerCheckboxSelected(selectedItem)
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

    const handleStartPioneerDateChange = (date: Date) => {
        setStartPioneer(date)
    }

    const handleCheckboxSituationPublisher = (selectedItems: string) => {
        setSituationPublisherCheckboxSelected(selectedItems)
    }

    useEffect(() => {
        const updatePrivileges = []
        if (pioneerCheckboxSelected !== '') updatePrivileges.push(pioneerCheckboxSelected)
        if (privilegeCheckboxSelected !== '') updatePrivileges.push(privilegeCheckboxSelected)
        setAllPrivileges(updatePrivileges)
    }, [pioneerCheckboxSelected, privilegeCheckboxSelected])

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
            allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR],
            data.nickname,
            immersedDate ?? undefined,
            birthDate ?? undefined,
            auxPioneerMonthsSelected, 
            situationPublisherCheckboxSelected ?? Situation.ATIVO, 
            startPioneer ?? undefined
        ), {
            pending: 'Criando novo publicador',
        })
        reset()
        setGenderCheckboxSelected('')
        setHopeCheckboxSelected('')
        setAllPrivileges([])
        setPrivilegeCheckboxSelected('')
        setPioneerCheckboxSelected('')
        setStartPioneer(null)
        setImmersedDate(null)
        setBirthDate(null)
        setHopeCheckboxSelected('')
    }

    useEffect(() => {
        if (!pioneerCheckboxSelected.includes(Privileges.PIONEIROAUXILIAR)) {
            setAuxPioneerMonthsSelected([])
        }
    }, [pioneerCheckboxSelected])

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

                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={genderCheckboxSelected} label="Gênero" options={optionsCheckboxGender[0]} handleCheckboxChange={(selectedItems) => handleCheckboxGender(selectedItems)} />
                    </div>

                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={hopeCheckboxSelected} label="Esperança" options={optionsCheckboxHope[0]} handleCheckboxChange={(selectedItems) => handleCheckboxHope(selectedItems)} />
                    </div>

                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={situationPublisherCheckboxSelected} label="Situação do publicador" options={optionsCheckboxSituationPublisher[0]} handleCheckboxChange={(selectedItems) => handleCheckboxSituationPublisher(selectedItems)} />
                    </div>

                    {situationPublisherCheckboxSelected === Situation.ATIVO && <div className='border border-gray-300 my-4 p-4'>
                        {<CheckboxUnique visibleLabel checked={pioneerCheckboxSelected} label="Pioneiro" options={optionsCheckboxPioneer} handleCheckboxChange={(selectedItems) => handleCheckboxPioneer(selectedItems)} />}

                        {pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) && <CheckboxMultiple checkedOptions={auxPioneerMonthsSelected} label='Meses Pioneiro Auxiliar' visibleLabel options={optionsPioneerMonths[0]} handleCheckboxChange={(selectedItems) => handleAuxPioneerMonths(selectedItems)} />}

                        {(pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && <Calendar key="calendarStartPioneerDate" label="Data Inicial:" handleDateChange={handleStartPioneerDateChange} selectedDate={startPioneer} />}
                    </div>}

                    {situationPublisherCheckboxSelected === Situation.ATIVO && genderCheckboxSelected === 'Masculino' && <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={privilegeCheckboxSelected} label="Privilégio" options={optionsCheckboxPrivileges} handleCheckboxChange={(selectedItems) => handleCheckboxPrivileges(selectedItems)} />
                    </div>}

                    <div className='border border-gray-300 my-4 p-4'>
                        <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handleBirthDateChange} selectedDate={birthDate} />

                        <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handleImmersedDateChange} selectedDate={immersedDate} />
                    </div>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} disabled={(genderCheckboxSelected === '' || hopeCheckboxSelected === '') ? true : disabled} success={dataSuccess} type='submit'>Criar Publicador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}