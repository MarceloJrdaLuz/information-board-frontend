import { buttonDisabled, errorFormSend, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { usePublisherContext } from '@/context/PublisherContext'
import { Gender, Hope, IEmergencyContact, IPublisher, Privileges, Situation } from '@/entities/types'
import { capitalizeFirstLetter } from '@/functions/isAuxPioneerMonthNow'
import { getMonthsByYear, getYearService } from '@/functions/meses'
import { useFetch } from '@/hooks/useFetch'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import FormAddEmergencyContact from '../FormAddEmergencyContact'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import { publisherEditSchema } from './validations'
import Router from 'next/router'
import { ChevronDownIcon, PlusCircleIcon, PlusIcon, PlusSquareIcon } from 'lucide-react'

export interface IUpdatePublisher {
    id: string
}

export default function FormEditPublisher(props: IUpdatePublisher) {
    const { updatePublisher } = usePublisherContext()
    const [publisherToUpdate, setPublisherToUpdate] = useState<IPublisher>()
    const { data } = useFetch<IPublisher>(`/publisher/${props.id}`)
    const [isFormChanged, setIsFormChanged] = useState(false)
    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [privilegeCheckboxSelected, setPrivilegeCheckboxSelected] = useState('')
    const [auxPioneerMonthsSelected, setAuxPioneerMonthsSelected] = useState<string[]>([])
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')
    const [pioneerCheckboxSelected, setPioneerCheckboxSelected] = useState<string>('')
    const [situationPublisherCheckboxSelected, setSituationPublisherCheckboxSelected] = useState<string>('')
    const [initialFullNameValue, setInitialFullNameValue] = useState<string>('')
    const [initialNicknameValue, setInitialNicknameValue] = useState<string>('')
    const [initialAddressValue, setInitialAddressValue] = useState<string>('')
    const [initialPhoneValue, setInitialPhoneValue] = useState<string>('')
    const [immersedDate, setImmersedDate] = useState<Date | null>(null)
    const [birthDate, setBirthDate] = useState<Date | null>(null)
    const [startPioneer, setStartPioneer] = useState<Date | null>(null)
    const [allPrivileges, setAllPrivileges] = useState<string[]>([])
    const [yearService, setYearService] = useState(getYearService().toString())

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const [emergencyContactShow, setEmergencyContactShow] = useAtom(showModalEmergencyContact)

    const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(data?.emergencyContact?.id || null);

    const fetchEmergencyContactDataConfig = publisherToUpdate ? `/emergencyContacts/${publisherToUpdate?.congregation?.id}` : ''
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)

    console.log(existingContacts)

    const optionsCheckboxGender = useState<string[]>(Object.values(Gender))
    const optionsCheckboxHope = useState(Object.values(Hope))
    const optionsCheckboxSituationPublisher = useState(Object.values(Situation))
    const optionsCheckboxPrivileges = useMemo(() => [`${Privileges.ANCIAO}`, `${Privileges.SM}`], [])
    const optionsCheckboxPioneer = useMemo(() => [`${Privileges.PIONEIROAUXILIAR}`, `${Privileges.AUXILIARINDETERMINADO}`, `${Privileges.MISSIONARIOEMCAMPO}`, `${Privileges.PIONEIROESPECIAL}`, `${Privileges.PIONEIROREGULAR}`], [])


    // Carregar dados do publisher
    useEffect(() => {
        if (data) {
            const isPrivilege = data.privileges.filter(privilege => optionsCheckboxPrivileges.includes(privilege))
            const isPioneer = data.privileges.filter(privilege => optionsCheckboxPioneer.includes(privilege))

            setPublisherToUpdate(data)
            setInitialFullNameValue(data.fullName)
            setInitialNicknameValue(data.nickname ?? '')
            setInitialAddressValue(data.address ?? '')
            setInitialPhoneValue(data.phone ?? '')
            setGenderCheckboxSelected(data.gender)
            setSituationPublisherCheckboxSelected(data.situation)
            setPrivilegeCheckboxSelected(isPrivilege[0])
            setPioneerCheckboxSelected(isPioneer[0])
            setAllPrivileges(data.privileges || [])
            setAuxPioneerMonthsSelected(data.pioneerMonths || [])
            setHopeCheckboxSelected(data.hope)
            setSelectedEmergencyContact(data.emergencyContact?.id ?? null)
            if (data.birthDate) setBirthDate(new Date(data.birthDate))
            if (data.dateImmersed) setImmersedDate(new Date(data.dateImmersed))
            if (data.startPioneer) setStartPioneer(new Date(data.startPioneer))
        }
    }, [data, optionsCheckboxPioneer, optionsCheckboxPrivileges])

    const handleCheckboxGender = (selectedItems: string) => setGenderCheckboxSelected(selectedItems)
    const handleCheckboxHope = (selectedItems: string) => setHopeCheckboxSelected(selectedItems)
    const handleCheckboxSituationPublisher = (selectedItems: string) => setSituationPublisherCheckboxSelected(selectedItems)

    const { register, reset, handleSubmit, formState: { errors }, watch, control } = useForm<FormValues>({
        resolver: yupResolver(publisherEditSchema)
    })

    const watchFullName = watch('fullName')
    const watchNickname = watch('nickname')
    const watchAddress = watch('address')
    const watchPhone = watch('phone')

    useEffect(() => {
        const updatePrivileges = []
        if (pioneerCheckboxSelected) updatePrivileges.push(pioneerCheckboxSelected)
        if (privilegeCheckboxSelected) updatePrivileges.push(privilegeCheckboxSelected)
        setAllPrivileges(updatePrivileges)
    }, [pioneerCheckboxSelected, privilegeCheckboxSelected])

    useEffect(() => {
        if (publisherToUpdate) {
            reset({
                fullName: publisherToUpdate.fullName ?? '',
                nickname: publisherToUpdate.nickname ?? '',
                address: publisherToUpdate.address ?? '',
                phone: publisherToUpdate.phone ?? ''
            })
        }
    }, [publisherToUpdate, reset])

    useEffect(() => {
        const isChanged =
            watchFullName !== initialFullNameValue ||
            watchNickname !== initialNicknameValue ||
            watchAddress !== initialAddressValue ||
            watchPhone !== initialPhoneValue ||
            genderCheckboxSelected !== (data?.gender || '') ||
            hopeCheckboxSelected !== (data?.hope || '') ||
            situationPublisherCheckboxSelected !== (data?.situation || '') ||
            allPrivileges.join() !== (data?.privileges || []).join() ||
            auxPioneerMonthsSelected.join() !== (data?.pioneerMonths || []).join() ||
            birthDate?.getTime() !== (data?.birthDate ? new Date(data.birthDate).getTime() : null) ||
            immersedDate?.getTime() !== (data?.dateImmersed ? new Date(data.dateImmersed).getTime() : null) ||
            startPioneer?.getTime() !== (data?.startPioneer ? new Date(data.startPioneer).getTime() : null)

        setIsFormChanged(isChanged)
    }, [
        publisherToUpdate,
        initialFullNameValue,
        initialNicknameValue,
        data,
        genderCheckboxSelected,
        hopeCheckboxSelected,
        allPrivileges,
        immersedDate,
        auxPioneerMonthsSelected,
        birthDate,
        startPioneer,
        watchFullName,
        watchNickname,
        watchAddress,
        initialAddressValue,
        watchPhone,
        initialPhoneValue,
        situationPublisherCheckboxSelected
    ])

    const onSubmit = (data: FormValues) => {
        toast.promise(
            updatePublisher(
                props.id,
                data.fullName,
                publisherToUpdate?.congregation?.id ?? '',
                genderCheckboxSelected,
                hopeCheckboxSelected,
                allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR],
                data.nickname,
                immersedDate ?? undefined,
                birthDate ?? undefined,
                auxPioneerMonthsSelected,
                situationPublisherCheckboxSelected,
                startPioneer ?? undefined,
                data.address,
                data.phone,
                selectedEmergencyContact ? selectedEmergencyContact : undefined
            ),
            { pending: 'Atualizando publicador' }
        )
    }

    function onError(error: any) {
        console.log(error)
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full h-fit flex-col justify-center items-center">
                    <div className="my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200">Atualizar publicador</div>

                    {/* Inputs básicos */}
                    <Input type="text" placeholder="Nome completo" registro={{ ...register('fullName') }} invalid={errors?.fullName?.message ? 'invalido' : ''} />
                    {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

                    <Input type="text" placeholder="Apelido" registro={{ ...register('nickname') }} invalid={errors?.nickname?.message ? 'invalido' : ''} />
                    <Input type="text" placeholder="Endereço" registro={{ ...register('address') }} invalid={errors?.address?.message ? 'invalido' : ''} />
                    <Controller name="phone" control={control} render={({ field }) => <Input type="tel" placeholder="Telefone" mask="(99) 99999-9999" {...field} />} />

                    {/* Checkboxes e Calendários */}
                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={genderCheckboxSelected} label="Gênero" options={optionsCheckboxGender[0]} handleCheckboxChange={handleCheckboxGender} />
                    </div>
                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={hopeCheckboxSelected} label="Esperança" options={optionsCheckboxHope[0]} handleCheckboxChange={handleCheckboxHope} />
                    </div>
                    <div className='border border-gray-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={situationPublisherCheckboxSelected} label="Situação do publicador" options={optionsCheckboxSituationPublisher[0]} handleCheckboxChange={handleCheckboxSituationPublisher} />
                    </div>
                    <div className='border border-gray-300 my-4 p-4'>
                        <div className='flex justify-between items-center'>
                            <span className='my-2 font-semibold text-gray-900 '>Contato de emergência</span>
                            <span className={`cursor-pointer w-6 h-6 mr-4 flex justify-center items-center transition-transform duration-300 ${emergencyContactShow && 'rotate-180'}`} onClick={() => setEmergencyContactShow(!emergencyContactShow)}><ChevronDownIcon /> </span>
                        </div>
                        {emergencyContactShow && (
                            <div
                                className={`overflow-hidden transition-all duration-1000 ease-in-out ${emergencyContactShow ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <DropdownObject<IEmergencyContact>
                                    title="Selecione um contato"
                                    items={existingContacts ?? []}
                                    selectedItem={existingContacts && existingContacts.find(c => c.id === selectedEmergencyContact) || null}
                                    handleChange={(contact) => { setSelectedEmergencyContact(contact?.id ?? null); }}
                                    labelKey="name"
                                    labelKeySecondary='phone'
                                />
                                <span onClick={() => Router.push("/congregacao/contatos-emergencia/add")} className='mt-5 cursor-pointer flex justify-end'>
                                    <Button type='button' className='w-fit'><span><PlusIcon className='bg-white rounded-full text-primary-200 p-1 w-5 h-5' /></span>Adicionar contato de emergência</Button>
                                </span>
                            </div>
                        )}
                    </div>


                    <div className='flex justify-center items-center m-auto w-11/12 h-12 my-[5%]'>
                        <Button error={dataError} success={dataSuccess} disabled={disabled || !isFormChanged} type='submit'>Atualizar publicador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
