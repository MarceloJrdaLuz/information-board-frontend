import * as yup from 'yup'

import { buttonDisabled, errorFormSend, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Calendar from '@/Components/Calendar'
import CheckboxMultiple from '@/Components/CheckBoxMultiple'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { additionalsPrivilegeOptions } from '@/constants/publisherOptions'
import { useAuthContext } from '@/context/AuthContext'
import { capitalizeFirstLetter } from '@/functions/isAuxPioneerMonthNow'
import { getMonthsByYear, getYearService } from '@/functions/meses'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { usePublisher } from '@/hooks/usePublisher'
import { IPayloadCreatePublisher } from '@/types/publishers'
import { Gender, Hope, IEmergencyContact, Privileges, Situation, UserTypes } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue } from 'jotai'
import { BookOpen, Calendar as CalendarIcon, ChevronDownIcon, HeartHandshake, Mail, PlusIcon, ShieldCheck, User, UserCheck, X } from 'lucide-react'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './type'


export default function FormAddPublisher() {

    const { createPublisher } = usePublisher()
    const { user } = useAuthContext()
    const congregationUser = user?.congregation

    const fetchEmergencyContactDataConfig = congregationUser ? `/emergencyContacts/${congregationUser?.id}` : ''
    const { data: existingContacts } = useFetch<IEmergencyContact[]>(fetchEmergencyContactDataConfig)
    const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(null);
    const [emergencyContactShow, setEmergencyContactShow] = useAtom(showModalEmergencyContact)

    const fetchUsersCongregation = congregationUser ? `/users/${congregationUser?.id}` : ''
    const { data: usersData } = useFetch<UserTypes[]>(fetchUsersCongregation)
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [additionalsPrivilegeCheckboxSelected, setAdditionalsPrivilegeCheckboxSelected] = useState<string[]>([])

    const [situationPublisherCheckboxSelected, setSituationPublisherCheckboxSelected] = useState<string>('')
    const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>('')
    const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>('')
    const [immersedDate, setImmersedDate] = useState<string | null>(null)
    const [birthDate, setBirthDate] = useState<string | null>(null)
    const [isPublisherApproved, setIsPublisherApproved] = useState<boolean>(true)
    const [startDatePublisher, setStartDatePublisher] = useState<string | null>(null)
    const [auxPioneerMonthsSelected, setAuxPioneerMonthsSelected] = useState<string[]>([])
    const [privilegeCheckboxSelected, setPrivilegeCheckboxSelected] = useState('')
    const [pioneerCheckboxSelected, setPioneerCheckboxSelected] = useState('')
    const [startPioneer, setStartPioneer] = useState<string | null>(null)
    const [allPrivileges, setAllPrivileges] = useState<string[]>([])
    const [yearService, setYearService] = useState(getYearService().toString())

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const optionsCheckboxSituationPublisher = useState(Object.values(Situation))

    const optionsCheckboxPrivileges = [`${Privileges.ANCIAO}`, `${Privileges.SM}`]

    const optionsCheckboxPioneer = [`${Privileges.PIONEIROAUXILIAR}`, `${Privileges.AUXILIARTEMPOINDETERMINADO}`, `${Privileges.MISSIONARIOEMCAMPO}`, `${Privileges.PIONEIROESPECIAL}`, `${Privileges.PIONEIROREGULAR}`]

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
        handleStartDatePublisherChange: setStartDatePublisher,
        handleCheckboxPioneer: setPioneerCheckboxSelected,
        handleCheckboxPrivileges: setPrivilegeCheckboxSelected,
        handleIsPublisherApprovedChange: (checked: boolean) => {
            setIsPublisherApproved(checked)
            if (!checked) {
                setPrivilegeCheckboxSelected('')
                setPioneerCheckboxSelected('')
                setAdditionalsPrivilegeCheckboxSelected([])
                setAuxPioneerMonthsSelected([])
                setStartPioneer(null)
                setStartDatePublisher(null)
            }
        },
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
            startDatePublisher: isPublisherApproved ? (startDatePublisher ?? undefined) : undefined,
            emergencyContact_id: selectedEmergencyContact ?? undefined,
            hope: hopeCheckboxSelected,
            nickname,
            phone,
            pioneerMonths: isPublisherApproved ? auxPioneerMonthsSelected : [],
            privileges: isPublisherApproved
                ? (allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR])
                : [],
            situation: situationPublisherCheckboxSelected ?? Situation.ATIVO,
            startPioneer: isPublisherApproved ? (startPioneer ?? undefined) : undefined,
            user_id: selectedUser ?? undefined
        }
        toast.promise(createPublisher(payload), {
            pending: 'Cadastrando nova pessoa',
        }).then(() => {
            reset()
            setGenderCheckboxSelected('')
            setHopeCheckboxSelected('')
            setAllPrivileges([])
            setPrivilegeCheckboxSelected('')
            setPioneerCheckboxSelected('')
            setStartPioneer(null)
            setImmersedDate(null)
            setBirthDate(null)
            setIsPublisherApproved(true)
            setStartDatePublisher(null)
            setHopeCheckboxSelected('')
            setSelectedUser(null)
            setSelectedEmergencyContact(null)
        }).catch((err) => {
            console.log(err)
        })
    }

    useEffect(() => {
        if (!pioneerCheckboxSelected.includes(Privileges.PIONEIROAUXILIAR)) {
            setAuxPioneerMonthsSelected([])
        }
    }, [pioneerCheckboxSelected])

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    const sortedEmergencyContacts = existingContacts ? sortArrayByProperty(existingContacts, "name") : existingContacts
    const sortedUsers = usersData ? sortArrayByProperty(usersData, "fullName") : usersData
    const selectedUserObj = sortedUsers?.find(c => c.id === selectedUser) || null

    return (
        <section className="flex w-full justify-center px-2 sm:px-4 pb-8 sm:pb-12 pt-4 sm:pt-6">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col gap-5">
                    {/* Header */}
                    <div className="pb-3 border-b border-surface-300">
                        <h2 className="text-xl sm:text-2xl font-bold text-typography-800 tracking-tight">Nova pessoa</h2>
                        <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                            Preencha as informações cadastrais da pessoa na congregação
                        </p>
                    </div>

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
                                registro={{ ...register('fullName', { required: "Campo obrigatório" }) }}
                                invalid={errors?.fullName?.message ? 'invalido' : ''}
                            />
                            {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 sm:gap-y-0">
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Apelido"
                                        registro={{ ...register('nickname', { required: "Campo obrigatório" }) }}
                                        invalid={errors?.nickname?.message ? 'invalido' : ''}
                                    />
                                    {errors?.nickname?.type && <InputError type={errors.nickname.type} field='nickname' />}
                                </div>
                                <div>
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
                                        checked={genderCheckboxSelected}
                                        label="Gênero"
                                        options={optionsCheckboxGender[0]}
                                        handleCheckboxChange={handlers.handleCheckboxGender}
                                    />
                                </div>
                                <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                    <CheckboxUnique
                                        visibleLabel
                                        checked={hopeCheckboxSelected}
                                        label="Esperança"
                                        options={optionsCheckboxHope[0]}
                                        handleCheckboxChange={handlers.handleCheckboxHope}
                                    />
                                </div>
                            </div>

                            <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 mt-3 shadow-xs">
                                <CheckboxUnique
                                    visibleLabel
                                    checked={situationPublisherCheckboxSelected}
                                    label="Situação"
                                    options={optionsCheckboxSituationPublisher[0]}
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
                                        {isPublisherApproved
                                            ? "Gera relatórios de campo mensais e cartão S-21"
                                            : "Cadastrado apenas como estudante da escola (não relata serviço de campo)"}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isPublisherApproved}
                                    onChange={(e) => handlers.handleIsPublisherApprovedChange(e.target.checked)}
                                    className="w-5 h-5 accent-primary-200 cursor-pointer rounded shrink-0"
                                />
                            </div>

                            {isPublisherApproved && (
                                <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-300">
                                    <Calendar
                                        full
                                        key="calendarStartDatePublisher"
                                        label="Data em que se tornou publicador (opcional):"
                                        handleDateChange={handlers.handleStartDatePublisherChange}
                                        selectedDate={startDatePublisher}
                                    />
                                </div>
                            )}

                            {isPublisherApproved && situationPublisherCheckboxSelected === Situation.ATIVO && (
                                <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs flex flex-col gap-3">
                                    <CheckboxUnique
                                        visibleLabel
                                        checked={pioneerCheckboxSelected}
                                        label="Pioneiro"
                                        options={optionsCheckboxPioneer}
                                        handleCheckboxChange={handlers.handleCheckboxPioneer}
                                    />

                                    {pioneerCheckboxSelected?.includes(Privileges.PIONEIROAUXILIAR) && (
                                        <div className="flex flex-col gap-3 pt-2 border-t border-surface-200">
                                            <CheckboxMultiple
                                                checkedOptions={auxPioneerMonthsSelected}
                                                label={`Meses Pioneiro Auxiliar - Ano de serviço ${yearService}`}
                                                visibleLabel
                                                options={optionsPioneerMonthsServiceYearActual[0]}
                                                handleCheckboxChange={handlers.handleAuxPioneerMonths}
                                            />
                                            <CheckboxMultiple
                                                checkedOptions={auxPioneerMonthsSelected}
                                                label={`Meses Pioneiro Auxiliar - Ano de serviço ${Number(yearService) - 1}`}
                                                visibleLabel
                                                options={optionsPioneerMonthsLastServiceYear[0]}
                                                handleCheckboxChange={handlers.handleAuxPioneerMonths}
                                            />
                                        </div>
                                    )}

                                    {(pioneerCheckboxSelected?.includes(Privileges.PIONEIROREGULAR) || pioneerCheckboxSelected?.includes(Privileges.AUXILIARTEMPOINDETERMINADO) || pioneerCheckboxSelected?.includes(Privileges.AUXILIARINDETERMINADO)) && (
                                        <div className="pt-2 border-t border-surface-200">
                                            <Calendar
                                                full
                                                key="calendarStartPioneerDate"
                                                label="Data Inicial:"
                                                handleDateChange={handlers.handleStartPioneerDateChange}
                                                selectedDate={startPioneer}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seção 3: Privilégios e Designações */}
                    {isPublisherApproved &&
                      situationPublisherCheckboxSelected === Situation.ATIVO &&
                      (genderCheckboxSelected === 'Feminino' || genderCheckboxSelected === 'Masculino') && (
                        <div className="border border-surface-300 rounded-2xl bg-surface-50/40 p-4 sm:p-5 shadow-xs">
                            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-surface-200">
                                <ShieldCheck className="w-4 h-4 text-primary-200" />
                                <h3 className="font-semibold text-sm sm:text-base text-typography-800">Privilégios e Designações</h3>
                            </div>

                            <div className="flex flex-col gap-3">
                                {genderCheckboxSelected === 'Feminino' && (
                                    <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                        <CheckboxMultiple
                                            visibleLabel
                                            checkedOptions={additionalsPrivilegeCheckboxSelected}
                                            label="Privilégios Adicionais"
                                            options={additionalsPrivilegeOptions.filter(
                                                p => p === Privileges.TESTEMUNHOPUBLICO
                                            )}
                                            handleCheckboxChange={handlers.handleCheckboxAdditionalPrivileges}
                                        />
                                    </div>
                                )}

                                {genderCheckboxSelected === 'Masculino' && (
                                    <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs flex flex-col gap-3">
                                        <CheckboxUnique
                                            allowUncheck
                                            visibleLabel
                                            checked={privilegeCheckboxSelected}
                                            label="Privilégio"
                                            options={optionsCheckboxPrivileges}
                                            handleCheckboxChange={handlers.handleCheckboxPrivileges}
                                        />
                                        <div className="pt-2 border-t border-surface-200">
                                            <CheckboxMultiple
                                                visibleLabel
                                                checkedOptions={additionalsPrivilegeCheckboxSelected}
                                                label="Privilégios Adicionais"
                                                options={additionalsPrivilegeOptions}
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
                                    selectedDate={birthDate}
                                />
                            </div>
                            <div className="border border-surface-300 rounded-xl bg-surface-100 p-3.5 shadow-xs">
                                <Calendar
                                    full
                                    key="calendarImmersedDate"
                                    label="Data do batismo:"
                                    handleDateChange={handlers.handleImmersedDateChange}
                                    selectedDate={immersedDate}
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
                                    selectedItem={sortedEmergencyContacts && sortedEmergencyContacts.find(c => c.id === selectedEmergencyContact) || null}
                                    handleChange={(contact) => { setSelectedEmergencyContact(contact?.id ?? null); }}
                                    labelKey="name"
                                    labelKeySecondary='phone'
                                    searchable
                                    full
                                />
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={() => Router.push("/congregacao/contatos-emergencia/add")}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-700 hover:text-primary-200 hover:border-primary-200 transition active:scale-95 shadow-xs cursor-pointer"
                                    >
                                        <PlusIcon className="w-4 h-4 shrink-0" />
                                        <span>Adicionar contato de emergência</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Seção 6: Vincular a Usuário do Sistema */}
                    <div className="border border-surface-300 dark:border-surface-600 rounded-2xl bg-surface-50/40 dark:bg-surface-800/30 p-4 sm:p-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 pb-3 border-b border-surface-200 dark:border-surface-700/60">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-primary-100/10 text-primary-200 shrink-0">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-typography-800 text-sm sm:text-base leading-snug">
                                        Vincular a Usuário do Sistema
                                    </h4>
                                    <p className="text-xs text-typography-500 mt-0.5">
                                        Vincule já este cadastro a uma conta de acesso existente
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-200/50 text-typography-600 dark:text-typography-300 border border-surface-300/50 whitespace-nowrap shrink-0">
                                    Opcional
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="text-xs text-typography-600">
                                Se este membro já possui um login de usuário criado na congregação, você pode vinculá-lo agora:
                            </p>
                            <DropdownObject<UserTypes>
                                title={sortedUsers ? "Selecione um usuário (opcional)..." : "Nenhum usuário cadastrado"}
                                textVisible
                                items={sortedUsers ?? []}
                                selectedItem={selectedUserObj}
                                handleChange={(user) => setSelectedUser(user?.id ?? null)}
                                labelKey="fullName"
                                labelKeySecondary="email"
                                showSecondaryLabelOnSelected
                                searchable
                                emptyMessage="Nenhum usuário encontrado"
                                full
                            />

                            {selectedUserObj && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-primary-50/40 dark:bg-primary-950/20 border border-primary-200/30 overflow-hidden w-full">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 shrink-0 rounded-full bg-primary-200/15 text-primary-200 font-bold flex items-center justify-center text-xs uppercase">
                                            {selectedUserObj.fullName?.charAt(0) || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-typography-900 truncate">
                                                {selectedUserObj.fullName}
                                            </p>
                                            <p className="text-[11px] text-typography-500 flex items-center gap-1 truncate">
                                                <Mail className="w-3 h-3 shrink-0 text-typography-400" />
                                                <span className="truncate">{selectedUserObj.email}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-500 rounded-xl border border-red-200 dark:border-red-900/50 transition active:scale-95 shadow-xs cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5 shrink-0" />
                                        <span>Remover</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botão de Envio */}
                    <div className="flex justify-center items-center w-full mt-3 pt-2">
                        <Button
                            className="w-full sm:w-auto min-w-[200px] h-[46px] text-sm font-semibold"
                            error={dataError}
                            disabled={(genderCheckboxSelected === '' || hopeCheckboxSelected === '') ? true : disabled}
                            success={dataSuccess}
                            type='submit'
                        >
                            Cadastrar pessoa
                        </Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}