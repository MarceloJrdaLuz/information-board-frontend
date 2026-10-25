import { buttonDisabled, errorFormSend, showConfirmForceModal, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Calendar from '@/Components/Calendar'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import { ConfirmLinkForceModal } from '@/Components/ConfirmLinkForceModal'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useAuthContext } from '@/context/AuthContext'
import { useCongregationContext } from '@/context/CongregationContext'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { usePublisher } from '@/hooks/usePublisher'
import { IEmergencyContact, Privileges, Situation, UserTypes } from '@/types/types'
import { useAtom, useAtomValue } from 'jotai'
import { BookOpen, Calendar as CalendarIcon, ChevronDownIcon, HeartHandshake, Mail, PlusIcon, RefreshCw, ShieldCheck, Unlink, User, UserCheck } from 'lucide-react'
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
        <section className="flex w-full justify-center px-2 sm:px-4 pb-8 sm:pb-12 pt-4 sm:pt-6">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                {!data ? (
                    <FormEditPublisherSkeleton />
                ) : (
                    <div className="w-full flex flex-col gap-5">
                        {/* Header */}
                        <div className="pb-3 border-b border-surface-300">
                            <h2 className="text-xl sm:text-2xl font-bold text-typography-800 tracking-tight">Atualizar pessoa</h2>
                            <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                Edite as informações cadastrais e privilégios da pessoa na congregação
                            </p>
                        </div>

                        {hasPermission && (
                            <>
                                {/* Seção 1: Dados Pessoais */}
                                <div className="border border-surface-300 rounded-2xl bg-surface-50/40 p-4 sm:p-5 shadow-xs">
                                    <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-surface-200">
                                        <User className="w-4 h-4 text-primary-200" />
                                        <h3 className="font-semibold text-sm sm:text-base text-typography-800">Dados Pessoais</h3>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Input
                                            type="text"
                                            placeholder="Nome completo"
                                            registro={{ ...register('fullName') }}
                                            invalid={errors?.fullName?.message ? 'invalido' : ''}
                                        />
                                        {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 sm:gap-y-0">
                                            <div>
                                                <Input
                                                    type="text"
                                                    placeholder="Apelido"
                                                    registro={{ ...register('nickname') }}
                                                    invalid={errors?.nickname?.message ? 'invalido' : ''}
                                                />
                                                {errors?.nickname?.type && <InputError type={errors.nickname.type} field='nickname' />}
                                            </div>
                                            <div>
                                                <Controller
                                                    defaultValue=''
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
                                            </div>
                                        </div>

                                        <Input
                                            type="text"
                                            placeholder="Endereço"
                                            registro={{ ...register('address') }}
                                            invalid={errors?.address?.message ? 'invalido' : ''}
                                        />
                                        {errors?.address?.type && <InputError type={errors.address.type} field='address' />}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                                <CheckboxUnique
                                                    visibleLabel
                                                    checked={values.genderCheckboxSelected}
                                                    label="Gênero"
                                                    options={options.genderOptions}
                                                    handleCheckboxChange={handlers.handleCheckboxGender}
                                                />
                                            </div>
                                            <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                                <CheckboxUnique
                                                    visibleLabel
                                                    checked={values.hopeCheckboxSelected}
                                                    label="Esperança"
                                                    options={options.hopeOptions}
                                                    handleCheckboxChange={handlers.handleCheckboxHope}
                                                />
                                            </div>
                                        </div>

                                        <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 mt-3 shadow-xs">
                                            <CheckboxUnique
                                                visibleLabel
                                                checked={values.situationPublisherCheckboxSelected}
                                                label="Situação"
                                                options={options.situationOptions}
                                                handleCheckboxChange={handlers.handleCheckboxSituationPublisher}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Seção 2: Classificação e Serviço de Campo */}
                                <div className="border border-surface-300 rounded-2xl bg-surface-50/40 p-4 sm:p-5 shadow-xs">
                                    <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-surface-200">
                                        <BookOpen className="w-4 h-4 text-primary-200" />
                                        <h3 className="font-semibold text-sm sm:text-base text-typography-800">Classificação & Serviço de Campo</h3>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 border border-surface-300">
                                            <div className="pr-3">
                                                <label className="text-sm font-semibold text-typography-800">
                                                    É publicador aprovado?
                                                </label>
                                                <p className="text-xs text-typography-500 mt-0.5">
                                                    {values.isPublisherApproved
                                                        ? "Gera relatórios de campo mensais e cartão S-21"
                                                        : "Cadastrado como estudante da escola (não relata serviço de campo)"}
                                                </p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={values.isPublisherApproved}
                                                onChange={(e) => handlers.handleIsPublisherApprovedChange(e.target.checked)}
                                                className="w-5 h-5 accent-primary-200 cursor-pointer rounded shrink-0"
                                            />
                                        </div>

                                        {values.isPublisherApproved && (
                                            <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-300">
                                                <Calendar
                                                    full
                                                    key="calendarStartDatePublisher"
                                                    label="Data em que se tornou publicador (opcional):"
                                                    handleDateChange={handlers.handleStartDatePublisherChange}
                                                    selectedDate={values.startDatePublisher}
                                                />
                                            </div>
                                        )}

                                        {values.isPublisherApproved && values.situationPublisherCheckboxSelected === Situation.ATIVO && (
                                            <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs flex flex-col gap-3">
                                                <CheckboxUnique
                                                    allowUncheck
                                                    visibleLabel
                                                    checked={values.pioneerCheckboxSelected}
                                                    label="Pioneiro"
                                                    options={options.pioneerOptions}
                                                    handleCheckboxChange={(selectedItems) => handlers.handleCheckboxPioneer(selectedItems)}
                                                />

                                                {values.pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) && (
                                                    <div className="flex flex-col gap-3 pt-2 border-t border-surface-200">
                                                        <CheckboxMultiple
                                                            checkedOptions={values.auxPioneerMonthsSelected}
                                                            label={`Meses Pioneiro Auxiliar - Ano de serviço ${values.yearService}`}
                                                            visibleLabel
                                                            options={options.optionsPioneerMonthsServiceYearActual}
                                                            handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)}
                                                        />
                                                        <CheckboxMultiple
                                                            checkedOptions={values.auxPioneerMonthsSelected}
                                                            label={`Meses Pioneiro Auxiliar - Ano de serviço ${Number(values.yearService) - 1}`}
                                                            visibleLabel
                                                            options={options.optionsPioneerMonthsLastServiceYear}
                                                            handleCheckboxChange={(selectedItems) => handlers.handleAuxPioneerMonths(selectedItems)}
                                                        />
                                                    </div>
                                                )}

                                                {(values.pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || values.pioneerCheckboxSelected?.includes(Privileges.AUXILIARTEMPOINDETERMINADO) || values.pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && (
                                                    <div className="pt-2 border-t border-surface-200">
                                                        <Calendar
                                                            full
                                                            key="calendarStartPioneerDate"
                                                            label="Data Inicial:"
                                                            handleDateChange={handlers.handleStartPioneerDateChange}
                                                            selectedDate={values.startPioneer}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Seção 3: Privilégios e Designações */}
                        {values.isPublisherApproved &&
                         values.situationPublisherCheckboxSelected === Situation.ATIVO &&
                         (values.genderCheckboxSelected === 'Feminino' || values.genderCheckboxSelected === 'Masculino') && (
                            <div className="border border-surface-300 rounded-2xl bg-surface-50/40 p-4 sm:p-5 shadow-xs">
                                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-surface-200">
                                    <ShieldCheck className="w-4 h-4 text-primary-200" />
                                    <h3 className="font-semibold text-sm sm:text-base text-typography-800">Privilégios e Designações</h3>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {values.genderCheckboxSelected === 'Feminino' && (
                                        <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                            <CheckboxMultiple
                                                visibleLabel
                                                checkedOptions={values.additionalsPrivilegeCheckboxSelected}
                                                label="Privilégios Adicionais"
                                                options={options.additionalsPrivilegeOptions.filter(
                                                    p => p === Privileges.TESTEMUNHOPUBLICO
                                                )}
                                                handleCheckboxChange={handlers.handleCheckboxAdditionalPrivileges}
                                            />
                                        </div>
                                    )}

                                    {values.genderCheckboxSelected === 'Masculino' && (
                                        <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs flex flex-col gap-3">
                                            <CheckboxUnique
                                                allowUncheck
                                                visibleLabel
                                                checked={values.privilegeCheckboxSelected}
                                                label="Privilégio"
                                                options={options.privilegeOptions}
                                                handleCheckboxChange={handlers.handleCheckboxPrivileges}
                                            />
                                            <div className="pt-2 border-t border-surface-200">
                                                <CheckboxMultiple
                                                    visibleLabel
                                                    checkedOptions={values.additionalsPrivilegeCheckboxSelected}
                                                    label="Privilégios Adicionais"
                                                    options={options.additionalsPrivilegeOptions}
                                                    handleCheckboxChange={handlers.handleCheckboxAdditionalPrivileges}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Seção 4: Datas Importantes */}
                        <div className="border border-surface-300 rounded-2xl bg-surface-50/40 p-4 sm:p-5 shadow-xs">
                            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-surface-200">
                                <CalendarIcon className="w-4 h-4 text-primary-200" />
                                <h3 className="font-semibold text-sm sm:text-base text-typography-800">Datas Importantes</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                    <Calendar
                                        full
                                        key="birthDate"
                                        label="Data de nascimento:"
                                        handleDateChange={handlers.handleBirthDateChange}
                                        selectedDate={values.birthDate}
                                    />
                                </div>
                                <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                    <Calendar
                                        full
                                        key="calendarImmersedDate"
                                        label="Data do batismo:"
                                        handleDateChange={handlers.handleImmersedDateChange}
                                        selectedDate={values.immersedDate}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção 5: Contato de Emergência */}
                        <div className="border border-surface-300 rounded-2xl bg-surface-50/40 p-4 sm:p-5 shadow-xs">
                            <div
                                className="flex justify-between items-center cursor-pointer select-none"
                                onClick={() => setEmergencyContactShow(!emergencyContactShow)}
                            >
                                <div className="flex items-center gap-2">
                                    <HeartHandshake className="w-4 h-4 text-primary-200" />
                                    <h3 className="font-semibold text-sm sm:text-base text-typography-800">Contato de emergência</h3>
                                </div>
                                <span className={`w-8 h-8 rounded-lg bg-surface-200/50 flex justify-center items-center transition-transform duration-300 ${emergencyContactShow ? 'rotate-180' : ''}`}>
                                    <ChevronDownIcon className="w-4 h-4 text-typography-600" />
                                </span>
                            </div>

                            {emergencyContactShow && (
                                <div className="mt-3 pt-3 border-t border-surface-200 flex flex-col gap-3">
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
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={() => Router.push("/congregacao/contatos-emergencia/add")}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-700 hover:text-primary-200 hover:border-primary-200 transition active:scale-95 shadow-xs cursor-pointer"
                                        >
                                            <PlusIcon className="w-4 h-4 shrink-0" />
                                            <span>Novo contato de emergência</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Seção 6: Conta de Usuário no Sistema */}
                        {hasPermission && (
                            <div className="border border-surface-300 dark:border-surface-600 rounded-2xl bg-surface-50/40 dark:bg-surface-800/30 p-4 sm:p-5 shadow-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 pb-3 border-b border-surface-200 dark:border-surface-700/60">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`p-2 rounded-xl shrink-0 ${data?.user ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary-100/10 text-primary-200'}`}>
                                            <UserCheck className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-typography-800 text-sm sm:text-base leading-snug">
                                                Conta de Usuário no Sistema
                                            </h4>
                                            <p className="text-xs text-typography-500 mt-0.5">
                                                Vínculo deste publicador ao login de acesso
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {data?.user ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Vinculado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap shrink-0">
                                                Não vinculado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {data?.user ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-100 dark:bg-surface-700/40 border border-surface-200 dark:border-surface-600/60 w-full overflow-hidden">
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

                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-0 w-full sm:w-auto shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsChangingUser(!isChangingUser)}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-700 transition active:scale-95 shadow-xs cursor-pointer"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{isChangingUser ? "Cancelar" : "Trocar usuário"}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleUnLinkPublisherToUser()}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-500 hover:text-white hover:bg-red-500 rounded-xl border border-red-200 dark:border-red-900/50 transition active:scale-95 shadow-xs cursor-pointer"
                                                >
                                                    <Unlink className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Desvincular</span>
                                                </button>
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
                                                <div className="flex items-center justify-end gap-2 pt-1">
                                                    <ConfirmLinkForceModal
                                                        button={
                                                            <button
                                                                type="button"
                                                                disabled={!selectedUser || selectedUser === data.user.id}
                                                                onClick={() => handleLinkPublisherToUser()}
                                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary-200 hover:bg-primary-300 text-white shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                            >
                                                                <UserCheck className="w-4 h-4 shrink-0" />
                                                                <span>Confirmar novo vínculo</span>
                                                            </button>
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
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1 w-full">
                                                <ConfirmLinkForceModal
                                                    button={
                                                        <button
                                                            type="button"
                                                            onClick={() => handleLinkPublisherToUser()}
                                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary-200 hover:bg-primary-300 text-white shadow-xs transition active:scale-95 cursor-pointer"
                                                        >
                                                            <UserCheck className="w-4 h-4 shrink-0" />
                                                            <span>Vincular a este usuário</span>
                                                        </button>
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

                        {/* Botão de Envio */}
                        <div className="flex justify-center items-center w-full mt-3 pt-2">
                            <Button
                                className="w-full sm:w-auto min-w-[200px] h-[46px] text-sm font-semibold"
                                error={dataError}
                                success={dataSuccess}
                                disabled={disabled}
                                type='submit'
                            >
                                Atualizar pessoa
                            </Button>
                        </div>
                    </div>
                )}
            </FormStyle>
        </section>
    )
}
