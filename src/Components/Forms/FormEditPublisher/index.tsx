import { buttonDisabled, errorFormSend, showConfirmForceModal, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Calendar from '@/Components/Calendar'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import { ConfirmLinkForceModal } from '@/Components/ConfirmLinkForceModal'
import DropdownObject from '@/Components/DropdownObjects'
import UserLinkIcon from '@/Components/Icons/UserLinkIcon'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useAuthContext } from '@/context/AuthContext'
import { useCongregationContext } from '@/context/CongregationContext'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { usePublisher } from '@/hooks/usePublisher'
import { IEmergencyContact, Privileges, Situation, UserTypes } from '@/types/types'
import { useAtom, useAtomValue } from 'jotai'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import FormEditPublisherSkeleton from './FormEditPublisherSkeleton'
import { useEditPublisherForm } from './hooks/useEditPublisherForm'

export interface IUpdatePublisher {
    id: string
}

export default function FormEditPublisher(props: IUpdatePublisher) {
    const { roleContains } = useAuthContext()
    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')
    const isPublisherManager = roleContains('PUBLISHERS_MANAGER')
    const hasPermission = isAdminCongregation || isPublisherManager
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const { linkPublisherToUser, unlinkPublisherToUser } = usePublisher()

    const {
        data,
        formMethods,
        isFormChanged,
        handlers,
        options,
        values,
        onSubmit,
        onError,
    } = useEditPublisherForm(props.id)

    const [modalConfirmForce, setModalConfirmeForce] = useAtom(showConfirmForceModal)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const [emergencyContactShow, setEmergencyContactShow] = useAtom(showModalEmergencyContact)

    const [selectedUser, setSelectedUser] = useState<string | null>(data?.user?.id ?? null)

    const fetchEmergencyContactDataConfig = hasPermission && congregation_id ? `/emergencyContacts/${congregation_id}` : ""
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)

    const fetchUsersCongregation = hasPermission && congregation_id ? `/users/${congregation_id}` : ''
    const { data: usersData } = useFetch<UserTypes[]>(fetchUsersCongregation)

    useEffect(() => {
        if (data?.user?.id) {
            setSelectedUser(data.user.id)
        }
    }, [data])

    function handleLinkPublisherToUser(force: boolean = false) {
        if (!selectedUser || !data?.id) {
            toast.error("Selecione um usuário e certifique-se que o publicador está carregado.")
            return
        }
        toast.promise(linkPublisherToUser({
            user_id: selectedUser,
            publisher_id: data.id,
            force
        }), {
            pending: 'Vinculando publicador...'
        }).then(() => {

        }).catch(err => {
            console.log(err)
        })
    }

    function handleUnLinkPublisherToUser() {
        toast.promise(unlinkPublisherToUser({ publisher_id: data?.id ?? "" }), {
            pending: 'Desvinculando publicador...'
        }).then(() => {

        }).catch(err => {
            console.log(err)
        })
    }

    async function handleConfirmForceLink() {
        handleLinkPublisherToUser(true)
    }

    // ------------------- FORM -------------------
    const { register, handleSubmit, formState: { errors }, control } = formMethods

    const sortedEmergencyContacts = existingContacts ? sortArrayByProperty(existingContacts, "name") : existingContacts
    const sortedUsers = usersData ? sortArrayByProperty(usersData, "fullName") : usersData

    return (
        <section className="flex w-full justify-center m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                {!data ? (
                    <FormEditPublisherSkeleton />
                ) : (
                    <div className="w-full h-fit flex-col justify-center items-center">
                        <div className="my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200">Atualizar publicador</div>
                        {hasPermission && (
                            <>
                                <Input type="text" placeholder="Nome completo" registro={{ ...register('fullName') }} invalid={errors?.fullName?.message ? 'invalido' : ''} />
                                {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

                                <Input type="text" placeholder="Apelido" registro={{ ...register('nickname') }} invalid={errors?.nickname?.message ? 'invalido' : ''} />
                                <Input type="text" placeholder="Endereço" registro={{ ...register('address') }} invalid={errors?.address?.message ? 'invalido' : ''} />
                                <Controller defaultValue='' name="phone" control={control} render={({ field }) => <Input type="tel" placeholder="Telefone" mask="(99) 99999-9999" {...field} />} />
                                {errors?.phone?.type && <InputError type={errors.phone.type} field='phone' />}

                                <div className='border border-typography-300 my-4 p-4'>
                                    <CheckboxUnique visibleLabel checked={values.genderCheckboxSelected} label="Gênero" options={options.genderOptions} handleCheckboxChange={handlers.handleCheckboxGender} />
                                </div>
                                <div className='border border-typography-300 my-4 p-4'>
                                    <CheckboxUnique visibleLabel checked={values.hopeCheckboxSelected} label="Esperança" options={options.hopeOptions} handleCheckboxChange={handlers.handleCheckboxHope} />
                                </div>
                                <div className='border border-typography-300 my-4 p-4'>
                                    <CheckboxUnique visibleLabel checked={values.situationPublisherCheckboxSelected} label="Situação do publicador" options={options.situationOptions} handleCheckboxChange={handlers.handleCheckboxSituationPublisher} />
                                </div>
                                {values.situationPublisherCheckboxSelected === Situation.ATIVO && <div className='border border-typography-300 my-4 p-4'>

                                    {<CheckboxUnique visibleLabel checked={values.pioneerCheckboxSelected} label="Pioneiro" options={options.pioneerOptions} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxPioneer(selectedItems)} />}

                                    {values.pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) &&
                                        (
                                            <>
                                                <CheckboxMultiple checkedOptions={values.auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${values.yearService}`} visibleLabel options={options.optionsPioneerMonthsServiceYearActual} handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)} />

                                                <CheckboxMultiple checkedOptions={values.auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${Number(values.yearService) - 1}`} visibleLabel options={options.optionsPioneerMonthsLastServiceYear} handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)} />
                                            </>

                                        )
                                    }

                                    {(values.pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || values.pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && <Calendar key="calendarStartPioneerDate" label="Data Inicial:" handleDateChange={handlers.handleStartPioneerDateChange} selectedDate={values.startPioneer} />}
                                </div>
                                }
                            </>
                        )}

                        {values.situationPublisherCheckboxSelected === Situation.ATIVO && values.genderCheckboxSelected === 'Masculino' && (
                            <div className='border border-typography-300 my-4 p-4'>
                                <CheckboxUnique visibleLabel checked={values.privilegeCheckboxSelected} label="Privilégio" options={options.privilegeOptions} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxPrivileges(selectedItems)} />

                                <CheckboxMultiple visibleLabel checkedOptions={values.additionalsPrivilegeCheckboxSelected} label="Privilégios Adicionais" options={options.additionalsPrivilegeOptions} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxAdditionalPrivileges(selectedItems)} />
                            </div>
                        )
                        }
                        <div className='border border-typography-300 my-4 p-4'>
                            <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handlers.handleBirthDateChange} selectedDate={values.birthDate} />

                            <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handlers.handleImmersedDateChange} selectedDate={values.immersedDate} />
                        </div>

                        <div className='border border-typography-300 my-4 p-4'>
                            <div className='flex justify-between items-center'>
                                <span className='my-2 font-semibold text-typography-900 '>Contato de emergência</span>
                                <span className={`cursor-pointer w-6 h-6 mr-4 flex justify-center items-center transition-transform duration-300 text-typography-700 ${emergencyContactShow && 'rotate-180'}`} onClick={() => setEmergencyContactShow(!emergencyContactShow)}><ChevronDownIcon className='text-typography-700' /> </span>
                            </div>
                            {emergencyContactShow && (
                                <>
                                    <DropdownObject<IEmergencyContact>
                                        title={sortedEmergencyContacts ? "Selecione um contato" : "Nenhum contato cadastrado"}
                                        textVisible
                                        items={sortedEmergencyContacts ?? []}
                                        selectedItem={sortedEmergencyContacts && sortedEmergencyContacts.find(c => c.id === values.selectedEmergencyContact) || null}
                                        handleChange={(contact) => { handlers.handleSelectedEmergencyContactChange(contact?.id ?? null); }}
                                        labelKey="name"
                                        labelKeySecondary='phone'
                                        searchable
                                        full
                                    />
                                    <span onClick={() => Router.push("/congregacao/contatos-emergencia/add")} className='mt-5 cursor-pointer flex justify-end'>
                                        <Button type='button' className='w-fit text-typography-200'><span><PlusIcon className='bg-transparent rounded-full text-surface-200 w-5 h-5' /></span>Novo contato de emergência</Button>
                                    </span>
                                </>
                            )}
                        </div>

                        {hasPermission &&
                            (<div className='border border-typography-300 my-4 p-4'>
                                <span className='my-2 font-semibold text-typography-900 '>Vincular publicador a usuário</span>
                                <div className='flex flex-col w-full items-start justify-start my-4 gap-5'>
                                    <DropdownObject<UserTypes>
                                        title={sortedUsers ? "Selecione um contato" : "Nenhum contato cadastrado"}
                                        textVisible
                                        items={sortedUsers ?? []}
                                        selectedItem={sortedUsers && sortedUsers.find(c => c.id === selectedUser) || null}
                                        handleChange={(user) => { setSelectedUser(user?.id ?? null); }}
                                        labelKey="fullName"
                                        searchable
                                        full
                                    />
                                    <ConfirmLinkForceModal button={
                                        <Button
                                            outline
                                            type='button'
                                            onClick={() => { handleLinkPublisherToUser() }}
                                            className=" text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                                            <UserLinkIcon />
                                            <span className="text-primary-200 font-semibold">Vincular</span>
                                        </Button>
                                    }
                                        onDelete={() => handleConfirmForceLink()}
                                        message='Houve um conflito na hora de vincular esse publicador. Você deseja realmente substituir o vínculo atual?'
                                        canOpen={modalConfirmForce}
                                    />
                                    <Button
                                        outline
                                        type='button'
                                        onClick={() => { handleUnLinkPublisherToUser() }}
                                        className=" text-red-400 p-3 border-typography-300 rounded-none hover:opacity-80">
                                        <UserLinkIcon />
                                        <span className="text-red-400 font-semibold">Desvincular</span>
                                    </Button>
                                </div>
                            </div>)
                        }

                        <div className='flex justify-center items-center m-auto w-11/12 h-12 my-[5%]'>
                            <Button className='text-typography-200' error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Atualizar publicador</Button>
                        </div>
                    </div>
                )}
            </FormStyle>
        </section>
    )
}
