import * as yup from 'yup'

import { buttonDisabled, errorFormSend, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Calendar from '@/Components/Calendar'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useAuthContext } from '@/context/AuthContext'
import { usePublisherContext } from '@/context/PublisherContext'
import { capitalizeFirstLetter } from '@/functions/isAuxPioneerMonthNow'
import { getMonthsByYear, getYearService } from '@/functions/meses'
import { useFetch } from '@/hooks/useFetch'
import { IPayloadCreatePublisher } from '@/types/publishers'
import { Gender, Hope, IEmergencyContact, Privileges, Situation } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormAddEmergencyContact from '../FormAddEmergencyContact'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import Router from 'next/router'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import { additionalsPrivilegeOptions } from '@/constants/publisherOptions'


export default function FormAddPublisher() {

    const { createPublisher } = usePublisherContext()
    const { user } = useAuthContext()
    const congregationUser = user?.congregation

    const fetchEmergencyContactDataConfig = congregationUser ? `/emergencyContacts/${congregationUser?.id}` : ''
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)
    const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(null);
    const [emergencyContactShow, setEmergencyContactShow] = useAtom(showModalEmergencyContact)
    const [additionalsPrivilegeCheckboxSelected, setAdditionalsPrivilegeCheckboxSelected] = useState<string[]>([])



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

    const handlers = {
        handleCheckboxAdditionalPrivileges: setAdditionalsPrivilegeCheckboxSelected,
        handleCheckboxSituationPublisher: setSituationPublisherCheckboxSelected,
        handleStartPioneerDateChange: setStartPioneer,
        handleAuxPioneerMonths: setAuxPioneerMonthsSelected,
        handleImmersedDateChange: setImmersedDate,
        handleBirthDateChange: setBirthDate,
        handleCheckboxPioneer: setPioneerCheckboxSelected,
        handleCheckboxPrivileges: setPrivilegeCheckboxSelected,
        handleCheckboxHope: setHopeCheckboxSelected,
        handleCheckboxGender: setGenderCheckboxSelected
    }

    useEffect(() => {
        const updatedPrivileges: string[] = []
        if (pioneerCheckboxSelected) updatedPrivileges.push(pioneerCheckboxSelected)
        if (privilegeCheckboxSelected) updatedPrivileges.push(privilegeCheckboxSelected)
        if (additionalsPrivilegeCheckboxSelected.length > 0) {
            updatedPrivileges.push(...additionalsPrivilegeCheckboxSelected)
        }
        setAllPrivileges(updatedPrivileges)
    }, [pioneerCheckboxSelected, privilegeCheckboxSelected, additionalsPrivilegeCheckboxSelected])

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
                        <CheckboxUnique visibleLabel checked={genderCheckboxSelected} label="Gênero" options={optionsCheckboxGender[0]} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxGender(selectedItems)} />
                    </div>

                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={hopeCheckboxSelected} label="Esperança" options={optionsCheckboxHope[0]} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxHope(selectedItems)} />
                    </div>

                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={situationPublisherCheckboxSelected} label="Situação do publicador" options={optionsCheckboxSituationPublisher[0]} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxSituationPublisher(selectedItems)} />
                    </div>

                    {situationPublisherCheckboxSelected === Situation.ATIVO && <div className='border border-gray-300 my-4 p-4'>
                        {<CheckboxUnique visibleLabel checked={pioneerCheckboxSelected} label="Pioneiro" options={optionsCheckboxPioneer} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxPioneer(selectedItems)} />}

                        {pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) &&
                            (
                                <>
                                    <CheckboxMultiple checkedOptions={auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${yearService}`} visibleLabel options={optionsPioneerMonthsServiceYearActual[0]} handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)} />
                                    <CheckboxMultiple checkedOptions={auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${Number(yearService) - 1}`} visibleLabel options={optionsPioneerMonthsLastServiceYear[0]} handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)} />
                                </>

                            )
                        }

                        {(pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && <Calendar key="calendarStartPioneerDate" label="Data Inicial:" handleDateChange={handlers.handleStartPioneerDateChange} selectedDate={startPioneer} />}
                    </div>}

                    {situationPublisherCheckboxSelected === Situation.ATIVO && genderCheckboxSelected === 'Masculino' && <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={privilegeCheckboxSelected} label="Privilégio" options={optionsCheckboxPrivileges} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxPrivileges(selectedItems)} />
                        <CheckboxMultiple visibleLabel checkedOptions={additionalsPrivilegeCheckboxSelected} label="Privilégios Adicionais" options={additionalsPrivilegeOptions} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxAdditionalPrivileges(selectedItems)} />
                    </div>}

                    <div className='border border-gray-300 my-4 p-4'>
                        <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handlers.handleBirthDateChange} selectedDate={birthDate} />

                        <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handlers.handleImmersedDateChange} selectedDate={immersedDate} />
                    </div>

                    <div className='border border-gray-300 my-4 p-4'>
                        <div className='flex justify-between items-center'>
                            <span className='my-2 font-semibold text-gray-900 '>Contato de emergência</span>
                            <span className={`cursor-pointer w-6 h-6 mr-4 flex justify-center items-center transition-transform duration-300 ${emergencyContactShow && 'rotate-180'}`} onClick={() => setEmergencyContactShow(!emergencyContactShow)}><ChevronDownIcon /> </span>
                        </div>

                        {emergencyContactShow && (
                            <>
                                <DropdownObject<IEmergencyContact>
                                    title={existingContacts ? "Selecione um contato" : "Nenhum contato cadastrado"}
                                    textVisible
                                    items={existingContacts ?? []}
                                    selectedItem={existingContacts && existingContacts.find(c => c.id === selectedEmergencyContact) || null}
                                    handleChange={(contact) => { setSelectedEmergencyContact(contact?.id ?? null); }}
                                    labelKey="name"
                                    labelKeySecondary='phone'
                                    searchable
                                />
                                <span onClick={() => Router.push("/congregacao/contatos-emergencia/add")} className='mt-5 cursor-pointer flex justify-end'>
                                    <Button type='button' className='w-fit'><span><PlusIcon className='bg-white rounded-full text-primary-200 p-1 w-5 h-5' /></span>Adicionar contato de emergência</Button>
                                </span>
                            </>
                        )}
                    </div>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} disabled={(genderCheckboxSelected === '' || hopeCheckboxSelected === '') ? true : disabled} success={dataSuccess} type='submit'>Criar Publicador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}