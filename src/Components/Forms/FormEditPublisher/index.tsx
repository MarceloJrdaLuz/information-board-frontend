import { buttonDisabled, errorFormSend, showConfirmForceModal, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import DropdownObject from '@/Components/DropdownObjects'
import UserLinkIcon from '@/Components/Icons/UserLinkIcon'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { usePublisherContext } from '@/context/PublisherContext'
import { Gender, Hope, IEmergencyContact, IPublisher, Privileges, Situation, UserTypes } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue } from 'jotai'
import { ChevronDownIcon, PlusIcon, Trash } from 'lucide-react'
import Router from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import { publisherEditSchema } from './validations'
import { ConfirmDeleteModal } from '@/Components/ConfirmDeleteModal'
import { ConfirmLinkForceModal } from '@/Components/ConfirmLinkForceModal'

export interface IUpdatePublisher {
    id: string
}

export default function FormEditPublisher(props: IUpdatePublisher) {
    const { updatePublisher, linkPublisherToUser, unlinkPublisherToUser } = usePublisherContext()
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
    const [modalConfirmForce, setModalConfirmeForce] = useAtom(showConfirmForceModal)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const [emergencyContactShow, setEmergencyContactShow] = useAtom(showModalEmergencyContact)

    const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(data?.emergencyContact?.id || null);
    const [selectedUser, setSelectedUser] = useState<string | null>(data?.user?.id ?? null);

    const fetchEmergencyContactDataConfig = publisherToUpdate ? `/emergencyContacts/${publisherToUpdate?.congregation?.id}` : ''
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)

    const fetchUsersCongregation = publisherToUpdate ? `/users/${publisherToUpdate?.congregation?.id}` : ''
    const { data: usersData } = useFetch<UserTypes[]>(fetchUsersCongregation)

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
            setSelectedUser(data.user?.id ?? "")
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


    function handleLinkPublisherToUser(force: boolean = false) {
        if (!selectedUser || !publisherToUpdate?.id) {
            toast.error("Selecione um usuário e certifique-se que o publicador está carregado.");
            return
        }

        toast.promise(linkPublisherToUser({
            user_id: selectedUser ?? "",
            publisher_id: publisherToUpdate?.id ?? "",
            force
        }), {
            pending: 'Vinculando publicador...'
        })
    }

    function handleUnLinkPublisherToUser() {
        toast.promise(unlinkPublisherToUser({
            publisher_id: publisherToUpdate?.id ?? ""
        }), {
            pending: 'Desvinculando publicador...'
        })
    }

    // Função chamada quando o usuário confirma no modal para forçar a vinculação
    async function handleConfirmForceLink() {
        handleLinkPublisherToUser(true)
    }

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
                    {errors?.phone?.type && <InputError type={errors.phone.type} field='phone' />}

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
                            <>
                                <DropdownObject<IEmergencyContact>
                                    title={existingContacts ? "Selecione um contato" : "Nenhum contato cadastrado"}
                                    textVisible
                                    items={existingContacts ?? []}
                                    selectedItem={existingContacts && existingContacts.find(c => c.id === selectedEmergencyContact) || null}
                                    handleChange={(contact) => { setSelectedEmergencyContact(contact?.id ?? null); }}
                                    labelKey="name"
                                    labelKeySecondary='phone'
                                />
                                <span onClick={() => Router.push("/congregacao/contatos-emergencia/add")} className='mt-5 cursor-pointer flex justify-end'>
                                    <Button type='button' className='w-fit'><span><PlusIcon className='bg-white rounded-full text-primary-200 p-1 w-5 h-5' /></span>Adicionar contato de emergência</Button>
                                </span>
                            </>
                        )}
                    </div>

                    <div className='border border-gray-300 my-4 p-4'>
                        <span className='my-2 font-semibold text-gray-900 '>Vincular publicador a usuário</span>
                        <div className='flex flex-col w-full items-start justify-start my-4 gap-5'>
                            <DropdownObject<UserTypes>
                                title={existingContacts ? "Selecione um contato" : "Nenhum contato cadastrado"}
                                textVisible
                                items={usersData ?? []}
                                selectedItem={usersData && usersData.find(c => c.id === selectedUser) || null}
                                handleChange={(user) => { setSelectedUser(user?.id ?? null); }}
                                labelKey="fullName"
                            />
                            <ConfirmLinkForceModal button={
                                <Button
                                    type='button'
                                    onClick={() => { handleLinkPublisherToUser() }}
                                    className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                    <UserLinkIcon />
                                    <span className="text-primary-200 font-semibold">Vincular publicador</span>
                                </Button>
                            }
                                onDelete={() => handleConfirmForceLink()}
                                message='Houve um conflito na hora de vincular esse publicador. Você deseja realmente substituir o vínculo atual?'
                                canOpen={modalConfirmForce}
                            />
                            <Button
                                type='button'
                                onClick={() => { handleUnLinkPublisherToUser() }}
                                className="bg-white text-red-500 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <UserLinkIcon />
                                <span className="text-primary-200 font-semibold">Desvincular publicador</span>
                            </Button>
                        </div>
                    </div>



                    <div className='flex justify-center items-center m-auto w-11/12 h-12 my-[5%]'>
                        <Button error={dataError} success={dataSuccess} disabled={disabled || !isFormChanged} type='submit'>Atualizar publicador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
