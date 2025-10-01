import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { Controller, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { usePublisherContext } from '@/context/PublisherContext'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import Button from '@/Components/Button'
import { useAtom, useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Calendar from '@/Components/Calendar'
import { getMonthsByYear, getYearService } from '@/functions/meses'
import { Gender, Hope, IEmergencyContact, Privileges, Situation } from '@/entities/types'
import { capitalizeFirstLetter } from '@/functions/isAuxPioneerMonthNow'
import FormAddEmergencyContact from '../FormAddEmergencyContact'
import DropdownObject from '@/Components/DropdownObjects'
import { useFetch } from '@/hooks/useFetch'
import { IPayloadCreatePublisher } from '@/entities/publishers'


export default function FormAddPublisher() {

    const { createPublisher } = usePublisherContext()
    const { user } = useAuthContext()
    const congregationUser = user?.congregation

    const fetchEmergencyContactDataConfig = congregationUser ? `/emergencyContacts/${congregationUser?.id}` : ''
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)
    const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(null);

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
    const [yearService, setYearService] = useState(getYearService().toString())

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const [modalEmergencyContactShow, setModalEmergencyContactShow] = useAtom(showModalEmergencyContact)

    const optionsCheckboxSituationPublisher = useState(Object.values(Situation))

    const optionsCheckboxPrivileges = [`${Privileges.ANCIAO}`, `${Privileges.SM}`]

    const optionsCheckboxPioneer = [`${Privileges.PIONEIROAUXILIAR}`, `${Privileges.AUXILIARINDETERMINADO}`, `${Privileges.MISSIONARIOEMCAMPO}`, `${Privileges.PIONEIROESPECIAL}`, `${Privileges.PIONEIROREGULAR}`]

    const optionsCheckboxGender = useState<string[]>(Object.values(Gender))

    const optionsCheckboxHope = useState(Object.values(Hope))

    const serviceYearActual = getMonthsByYear(yearService).months
    const lastServiceYear = getMonthsByYear((Number(yearService) - 1).toString()).months

    const normalizeMonths = (months: string[]) => {
        const normalize = months.map(month => {
            const splitWord = month.split(" ")
            return `${capitalizeFirstLetter(splitWord[0])}-${splitWord[1]}`
        })

        return normalize
    }
    const optionsPioneerMonthsServiceYearActual = useState([...normalizeMonths(serviceYearActual)])
    const optionsPioneerMonthsLastServiceYear = useState([...normalizeMonths(lastServiceYear)])

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
        pioneerCheckboxSelected !== '' ? updatePrivileges.push(pioneerCheckboxSelected) : updatePrivileges.push(Privileges.PUBLICADOR)
        privilegeCheckboxSelected !== '' && updatePrivileges.push(privilegeCheckboxSelected)
        setAllPrivileges(updatePrivileges)
    }, [pioneerCheckboxSelected, privilegeCheckboxSelected])

    const validationSchema = yup.object({
        fullName: yup.string().required(),
        nickname: yup.string(),
        phone: yup
            .string()
            .nullable()
            .notRequired()
            .test('is-valid-phone', 'Telefone inválido', value => {
                if (!value) return true; // aceita vazio
                return /^\(\d{2}\) \d{5}-\d{4}$/.test(value); // valida formato se preenchido
            })

    })

    const { register, reset, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: {
            fullName: '',
            nickname: '',
            address: '',
            phone: ''
        }, resolver: yupResolver(validationSchema)
    })

    function onSubmit({ fullName, address, nickname, phone }: FormValues) {
        const payload: IPayloadCreatePublisher = {
            congregation_id: congregationUser?.id ?? "",
            fullName,
            gender: genderCheckboxSelected,
            address,
            birthDate: birthDate ?? undefined,
            dateImmersed: immersedDate ?? undefined,
            emergencyContact_id: selectedEmergencyContact ?? undefined,
            hope: hopeCheckboxSelected,
            nickname,
            phone,
            pioneerMonths: auxPioneerMonthsSelected,
            privileges: allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR],
            situation: situationPublisherCheckboxSelected ?? Situation.ATIVO
        }
        toast.promise(createPublisher(payload), {
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
            {modalEmergencyContactShow ? (
                <FormAddEmergencyContact congregation_id={`${congregationUser?.id}`} />
            ) : (
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

                        <Input type="text" placeholder="Endereço" registro={{ ...register('address') }} invalid={errors?.address?.message ? 'invalido' : ''} />
                        {errors?.address?.type && <InputError type={errors.address.type} field='address' />}

                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    placeholder="Telefone"
                                    mask="(99) 99999-9999"
                                    {...field}
                                />
                            )}
                        />
                        {errors?.phone?.type && <InputError type={errors.phone.type} field='phone' />}

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

                            {pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) &&
                                (
                                    <>
                                        <CheckboxMultiple checkedOptions={auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${yearService}`} visibleLabel options={optionsPioneerMonthsServiceYearActual[0]} handleCheckboxChange={(selectedItems) => handleAuxPioneerMonths(selectedItems)} />
                                        <CheckboxMultiple checkedOptions={auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${Number(yearService) - 1}`} visibleLabel options={optionsPioneerMonthsLastServiceYear[0]} handleCheckboxChange={(selectedItems) => handleAuxPioneerMonths(selectedItems)} />
                                    </>

                                )
                            }

                            {(pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && <Calendar key="calendarStartPioneerDate" label="Data Inicial:" handleDateChange={handleStartPioneerDateChange} selectedDate={startPioneer} />}
                        </div>}

                        {situationPublisherCheckboxSelected === Situation.ATIVO && genderCheckboxSelected === 'Masculino' && <div className='border border-gray-300 my-4 p-4'>
                            <CheckboxUnique visibleLabel checked={privilegeCheckboxSelected} label="Privilégio" options={optionsCheckboxPrivileges} handleCheckboxChange={(selectedItems) => handleCheckboxPrivileges(selectedItems)} />
                        </div>}

                        <div className='border border-gray-300 my-4 p-4'>
                            <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handleBirthDateChange} selectedDate={birthDate} />

                            <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handleImmersedDateChange} selectedDate={immersedDate} />
                        </div>

                        <DropdownObject<IEmergencyContact>
                            title="Selecione um contato"
                            items={existingContacts ?? []}
                            selectedItem={existingContacts && existingContacts.find(c => c.id === selectedEmergencyContact) || null}
                            handleChange={(contact) => { setSelectedEmergencyContact(contact?.id ?? null); }}
                            labelKey="name"
                            searchable
                        />

                        <p onClick={() => setModalEmergencyContactShow(true)} className='cursor-pointer'>
                            Adicionar contato de emergência:
                        </p>

                        <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                            <Button error={dataError} disabled={(genderCheckboxSelected === '' || hopeCheckboxSelected === '') ? true : disabled} success={dataSuccess} type='submit'>Criar Publicador</Button>
                        </div>
                    </div>
                </FormStyle>
            )}
        </section>
    )
}