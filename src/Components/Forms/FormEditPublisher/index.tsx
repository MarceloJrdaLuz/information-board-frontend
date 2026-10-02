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
import { ChevronDownIcon, PlusIcon, UserCheck, Unlink, RefreshCw, Mail, X } from 'lucide-react'
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
        mutate: mutatePublisher,
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
    const [isChangingUser, setIsChangingUser] = useState(false)

    const fetchEmergencyContactDataConfig = hasPermission && congregation_id ? `/emergencyContacts/${congregation_id}` : ""
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)

    const fetchUsersCongregation = hasPermission && congregation_id ? `/users/${congregation_id}` : ''
    const { data: usersData, mutate: mutateUsers } = useFetch<UserTypes[]>(fetchUsersCongregation)

    useEffect(() => {
        if (data?.user?.id) {
            setSelectedUser(data.user.id)
        } else {
            setSelectedUser(null)
        }
    }, [data])

    async function handleLinkPublisherToUser(force: boolean = false) {
        if (!selectedUser || !data?.id) {
            toast.error("Selecione um usuário para vincular.")
            return
        }
        try {
            await toast.promise(linkPublisherToUser({
                user_id: selectedUser,
                publisher_id: data.id,
                force
            }), {
                pending: 'Vinculando publicador ao usuário...'
            })
            setIsChangingUser(false)
            await Promise.all([mutatePublisher?.(), mutateUsers?.()])
        } catch (err) {
            console.log(err)
        }
    }

    async function handleUnLinkPublisherToUser() {
        if (!data?.id) return
        try {
            await toast.promise(unlinkPublisherToUser({ publisher_id: data.id }), {
                pending: 'Desvinculando usuário...'
            })
            setSelectedUser(null)
            setIsChangingUser(false)
            await Promise.all([mutatePublisher?.(), mutateUsers?.()])
        } catch (err) {
            console.log(err)
        }
    }

    async function handleConfirmForceLink() {
        await handleLinkPublisherToUser(true)
    }

    // ------------------- FORM -------------------
    const { register, handleSubmit, formState: { errors }, control } = formMethods

    const sortedEmergencyContacts = existingContacts ? sortArrayByProperty(existingContacts, "name") : existingContacts
    const sortedUsers = usersData ? sortArrayByProperty(usersData, "fullName") : usersData

    return (
        <section className="flex w-full justify-center p-2 sm:p-4 pb-36 pt-6">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                {!data ? (
                    <FormEditPublisherSkeleton />
                ) : (
                    <div className="w-full flex flex-col">
                        <div className="form-title-modern">Atualizar publicador</div>
                        {hasPermission && (
                            <>
                                <Input type="text" placeholder="Nome completo" registro={{ ...register('fullName') }} invalid={errors?.fullName?.message ? 'invalido' : ''} />
                                {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

                                <Input type="text" placeholder="Apelido" registro={{ ...register('nickname') }} invalid={errors?.nickname?.message ? 'invalido' : ''} />
                                <Input type="text" placeholder="Endereço" registro={{ ...register('address') }} invalid={errors?.address?.message ? 'invalido' : ''} />
                                <Controller defaultValue='' name="phone" control={control} render={({ field }) => <Input type="tel" placeholder="Telefone" mask="(99) 99999-9999" {...field} />} />
                                {errors?.phone?.type && <InputError type={errors.phone.type} field='phone' />}

                                <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
                                    <CheckboxUnique visibleLabel checked={values.genderCheckboxSelected} label="Gênero" options={options.genderOptions} handleCheckboxChange={handlers.handleCheckboxGender} />
                                </div>
                                <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
                                    <CheckboxUnique visibleLabel checked={values.hopeCheckboxSelected} label="Esperança" options={options.hopeOptions} handleCheckboxChange={handlers.handleCheckboxHope} />
                                </div>
                                <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
                                    <CheckboxUnique visibleLabel checked={values.situationPublisherCheckboxSelected} label="Situação do publicador" options={options.situationOptions} handleCheckboxChange={handlers.handleCheckboxSituationPublisher} />
                                </div>
                                {values.situationPublisherCheckboxSelected === Situation.ATIVO && <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>

                                    {<CheckboxUnique allowUncheck visibleLabel checked={values.pioneerCheckboxSelected} label="Pioneiro" options={options.pioneerOptions} handleCheckboxChange={(selectedItems) => handlers.handleCheckboxPioneer(selectedItems)} />}

                                    {values.pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) &&
                                        (
                                            <>
                                                <CheckboxMultiple checkedOptions={values.auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${values.yearService}`} visibleLabel options={options.optionsPioneerMonthsServiceYearActual} handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)} />

                                                <CheckboxMultiple checkedOptions={values.auxPioneerMonthsSelected} label={`Meses Pioneiro Auxiliar - Ano de serviço ${Number(values.yearService) - 1}`} visibleLabel options={options.optionsPioneerMonthsLastServiceYear} handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)} />
                                            </>

                                        )
                                    }

                                    {(values.pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || values.pioneerCheckboxSelected?.includes(Privileges.AUXILIARTEMPOINDETERMINADO) || values.pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && <Calendar key="calendarStartPioneerDate" label="Data Inicial:" handleDateChange={handlers.handleStartPioneerDateChange} selectedDate={values.startPioneer} />}
                                </div>
                                }
                            </>
                        )}

                        {values.situationPublisherCheckboxSelected === Situation.ATIVO &&
                            values.genderCheckboxSelected === 'Feminino' && (
                                <div className="border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs">
                                    <CheckboxMultiple
                                        visibleLabel
                                        checkedOptions={values.additionalsPrivilegeCheckboxSelected}
                                        label="Privilégios Adicionais"
                                        options={
                                            options.additionalsPrivilegeOptions.filter(
                                                p => p === Privileges.TESTEMUNHOPUBLICO
                                            )
                                        }
                                        handleCheckboxChange={handlers.handleCheckboxAdditionalPrivileges}
                                    />
                                </div>
                            )
                        }

                        {values.situationPublisherCheckboxSelected === Situation.ATIVO &&
                            values.genderCheckboxSelected === 'Masculino' && (
                                <div className="border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs">
                                    <CheckboxUnique
                                        allowUncheck
                                        visibleLabel
                                        checked={values.privilegeCheckboxSelected}
                                        label="Privilégio"
                                        options={options.privilegeOptions}
                                        handleCheckboxChange={handlers.handleCheckboxPrivileges}
                                    />

                                    <CheckboxMultiple
                                        visibleLabel
                                        checkedOptions={values.additionalsPrivilegeCheckboxSelected}
                                        label="Privilégios Adicionais"
                                        options={options.additionalsPrivilegeOptions}
                                        handleCheckboxChange={handlers.handleCheckboxAdditionalPrivileges}
                                    />
                                </div>
                            )
                        }


                        <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
                            <Calendar key="birthDate" label="Data de nascimento:" handleDateChange={handlers.handleBirthDateChange} selectedDate={values.birthDate} />

                            <Calendar key="calendarImmersedDate" label="Data do batismo:" handleDateChange={handlers.handleImmersedDateChange} selectedDate={values.immersedDate} />
                        </div>

                        <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
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
                                        emptyMessage='Nenhum contato encontrado'
                                        full
                                    />
                                    <span onClick={() => Router.push("/congregacao/contatos-emergencia/add")} className='mt-5 cursor-pointer flex justify-end'>
                                        <Button type='button' outline size="sm" className='w-fit'><span><PlusIcon className='w-4 h-4 mr-1' /></span>Novo contato de emergência</Button>
                                    </span>
                                </>
                            )}
                        </div>

                        {hasPermission && (
                            <div className="border border-surface-300 dark:border-surface-600 rounded-2xl bg-surface-50/50 dark:bg-surface-800/30 p-4 sm:p-5 my-4 shadow-xs">
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-surface-200 dark:border-surface-700/60">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-2 rounded-xl ${data?.user ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary-100/10 text-primary-200'}`}>
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-typography-900 text-sm sm:text-base">
                                                Conta de Usuário no Sistema
                                            </h4>
                                            <p className="text-xs text-typography-500">
                                                Vínculo deste publicador ao login de acesso
                                            </p>
                                        </div>
                                    </div>
                                    {data?.user ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Vinculado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            Não vinculado
                                        </span>
                                    )}
                                </div>

                                {data?.user ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-100/60 dark:bg-surface-700/40 border border-surface-200/80 dark:border-surface-600/60 w-full overflow-hidden">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 shrink-0 rounded-full bg-primary-200/15 text-primary-200 font-bold flex items-center justify-center text-sm uppercase">
                                                    {data.user.fullName?.charAt(0) || "U"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-typography-900 truncate">
                                                        {data.user.fullName}
                                                    </p>
                                                    <p className="text-xs text-typography-500 flex items-center gap-1 truncate">
                                                        <Mail className="w-3.5 h-3.5 shrink-0 text-typography-400" />
                                                        <span className="truncate">{data.user.email}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-0 w-full sm:w-auto shrink-0">
                                                <Button
                                                    type="button"
                                                    outline
                                                    onClick={() => setIsChangingUser(!isChangingUser)}
                                                    className="min-w-0 w-full sm:w-auto h-auto min-h-[36px] px-3.5 py-1.5 text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{isChangingUser ? "Cancelar" : "Trocar usuário"}</span>
                                                </Button>

                                                <Button
                                                    type="button"
                                                    outline
                                                    onClick={() => handleUnLinkPublisherToUser()}
                                                    className="min-w-0 w-full sm:w-auto h-auto min-h-[36px] px-3.5 py-1.5 text-xs font-medium whitespace-nowrap flex items-center justify-center gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50 cursor-pointer"
                                                >
                                                    <Unlink className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Desvincular</span>
                                                </Button>
                                            </div>
                                        </div>

                                        {isChangingUser && (
                                            <div className="mt-2 pt-3 border-t border-dashed border-surface-200 dark:border-surface-700 flex flex-col gap-3">
                                                <label className="text-xs font-medium text-typography-700">
                                                    Selecione o novo usuário para vincular:
                                                </label>
                                                <DropdownObject<UserTypes>
                                                    title={sortedUsers ? "Selecione um usuário..." : "Nenhum usuário cadastrado"}
                                                    textVisible
                                                    items={sortedUsers ?? []}
                                                    selectedItem={sortedUsers && sortedUsers.find(c => c.id === selectedUser) || null}
                                                    handleChange={(user) => setSelectedUser(user?.id ?? null)}
                                                    labelKey="fullName"
                                                    labelKeySecondary="email"
                                                    showSecondaryLabelOnSelected
                                                    searchable
                                                    emptyMessage="Nenhum usuário encontrado"
                                                    full
                                                />
                                                <div className="flex items-center gap-2">
                                                    <ConfirmLinkForceModal
                                                        button={
                                                            <Button
                                                                type="button"
                                                                disabled={!selectedUser || selectedUser === data.user.id}
                                                                onClick={() => handleLinkPublisherToUser()}
                                                                className="min-w-0 w-full sm:w-auto h-auto min-h-[38px] px-4 py-2 text-xs font-semibold whitespace-nowrap bg-primary-200 hover:bg-primary-300 text-white rounded-xl shadow-xs flex items-center justify-center cursor-pointer"
                                                            >
                                                                <UserCheck className="w-4 h-4 mr-1.5 shrink-0" />
                                                                <span>Confirmar novo vínculo</span>
                                                            </Button>
                                                        }
                                                        onDelete={() => handleConfirmForceLink()}
                                                        message="Houve um conflito na hora de vincular esse publicador. Você deseja realmente substituir o vínculo atual?"
                                                        canOpen={modalConfirmForce}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-xs text-typography-600">
                                            Este publicador ainda não está vinculado a nenhuma conta de acesso. Selecione um usuário abaixo para permitir que ele envie relatórios e visualize designações:
                                        </p>
                                        <DropdownObject<UserTypes>
                                            title={sortedUsers ? "Selecione um usuário da congregação..." : "Nenhum usuário cadastrado"}
                                            textVisible
                                            items={sortedUsers ?? []}
                                            selectedItem={sortedUsers && sortedUsers.find(c => c.id === selectedUser) || null}
                                            handleChange={(user) => setSelectedUser(user?.id ?? null)}
                                            labelKey="fullName"
                                            labelKeySecondary="email"
                                            showSecondaryLabelOnSelected
                                            searchable
                                            emptyMessage="Nenhum usuário encontrado"
                                            full
                                        />
                                        {selectedUser && (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 w-full">
                                                <ConfirmLinkForceModal
                                                    button={
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleLinkPublisherToUser()}
                                                            className="min-w-0 w-full sm:w-auto h-auto min-h-[38px] px-4 py-2 text-xs font-semibold whitespace-nowrap bg-primary-200 hover:bg-primary-300 text-white rounded-xl shadow-xs flex items-center justify-center cursor-pointer"
                                                        >
                                                            <UserCheck className="w-4 h-4 mr-1.5 shrink-0" />
                                                            <span>Vincular a este usuário</span>
                                                        </Button>
                                                    }
                                                    onDelete={() => handleConfirmForceLink()}
                                                    message="Houve um conflito na hora de vincular esse publicador. Você deseja realmente substituir o vínculo atual?"
                                                    canOpen={modalConfirmForce}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-center items-center w-full mt-6">
                            <Button className="w-full sm:w-auto" error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Atualizar publicador</Button>
                        </div>
                    </div>
                )}
            </FormStyle>
        </section>
    )
}
