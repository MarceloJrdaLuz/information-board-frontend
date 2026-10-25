import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { selectedSpeakerAtom, updateSpeakerAtom } from '@/atoms/speakerAtoms'
import Button from '@/Components/Button'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import DropdownMulti from '@/Components/DropdownMulti'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { ICongregation, IPublisher, ISpeaker, ITalk } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues, SpeakerFormData } from './type'

interface FormEditSpeakerProps {
    speakerId?: string
}

export default function FormEditSpeaker({ speakerId: propSpeakerId }: FormEditSpeakerProps) {
    const router = useRouter()
    const speakerId = propSpeakerId || (router.query.id as string)

    const updateSpeaker = useSetAtom(updateSpeakerAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const selectedSpeaker = useAtomValue(selectedSpeakerAtom)

    // Se o orador não estiver no atom (ex: refresh da página), busca os dados completos pela API
    const shouldFetch = !!speakerId && (!selectedSpeaker || selectedSpeaker.id !== speakerId)
    const { data: fetchedSpeaker, isLoading: isLoadingSpeaker } = useFetch<ISpeaker>(
        shouldFetch ? `/speaker/${speakerId}` : ''
    )

    const currentSpeaker = (selectedSpeaker?.id === speakerId ? selectedSpeaker : fetchedSpeaker) || selectedSpeaker

    const { data: speakerFormData } = useFetch<SpeakerFormData>(`/form-data?form=speaker`)
    const sortedCongregations = sortArrayByProperty(speakerFormData?.congregations ?? [], "name")

    const [speakerIsPublisher, setSpeakerIsPublisher] = useState<boolean>(false)
    const [selectedTalks, setSelectedTalks] = useState<ITalk[]>([])
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)
    const [selectedSpeakerCongregation, setSelectedSpeakerCongregation] = useState<ICongregation | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validationSchema = yup.object({
        fullName: yup.string().when('$isPublisher', {
            is: false,
            then: (schema) => schema.required('Campo obrigatório'),
            otherwise: (schema) => schema.notRequired()
        }),
        phone: yup
            .string()
            .nullable()
            .notRequired()
            .test('is-valid-phone', 'Telefone inválido', (value) => {
                if (!value || value.trim() === '') return true
                const digits = value.replace(/\D/g, '')
                return digits.length >= 10 && digits.length <= 11
            }),
        address: yup.string().nullable().notRequired()
    })

    const { register, reset, handleSubmit, formState: { errors }, control } = useForm<FormValues>({
        defaultValues: {
            fullName: "",
            address: "",
            phone: ""
        },
        resolver: yupResolver(validationSchema),
        context: { isPublisher: speakerIsPublisher }
    })

    // Sincroniza os estados e os campos do formulário quando o orador for carregado
    useEffect(() => {
        if (currentSpeaker) {
            const isPub = !!currentSpeaker.publisher
            setSpeakerIsPublisher(isPub)
            setSelectedPublisher(currentSpeaker.publisher ?? null)
            setSelectedSpeakerCongregation(currentSpeaker.originCongregation ?? null)
            setSelectedTalks(currentSpeaker.talks ?? [])
            reset({
                fullName: currentSpeaker.fullName ?? "",
                address: currentSpeaker.address ?? "",
                phone: currentSpeaker.phone ?? ""
            })
        }
    }, [currentSpeaker, reset])

    async function onSubmit(data: FormValues) {
        const idToUpdate = currentSpeaker?.id || speakerId
        if (!idToUpdate) {
            toast.error("Identificador do orador não encontrado.")
            return
        }

        if (speakerIsPublisher && !selectedPublisher?.id) {
            toast.error("Selecione um publicador local.")
            return
        }

        const congregationId = !speakerIsPublisher
            ? selectedSpeakerCongregation?.id
            : (selectedPublisher?.congregation?.id || currentSpeaker?.originCongregation?.id)

        if (!speakerIsPublisher && !congregationId) {
            toast.error("Selecione uma congregação.")
            return
        }

        const publisherId = speakerIsPublisher ? selectedPublisher?.id : undefined
        const talk_ids = selectedTalks?.map((talk) => talk.id) ?? []

        const payload = {
            fullName: !speakerIsPublisher ? data.fullName : selectedPublisher?.fullName,
            originCongregation_id: congregationId,
            publisher_id: publisherId,
            address: !speakerIsPublisher ? data.address : selectedPublisher?.address,
            phone: !speakerIsPublisher ? data.phone : selectedPublisher?.phone,
            talk_ids
        }

        setIsSubmitting(true)
        const toastId = toast.loading('Atualizando orador...')
        try {
            await updateSpeaker(idToUpdate, payload)
            toast.dismiss(toastId)
            // updateSpeakerAtom invoca handleSubmitSuccessAtom que exibe o toast de sucesso e redireciona
        } catch (err) {
            toast.dismiss(toastId)
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    function onError(formErrors: any) {
        console.error("Erro na validação do formulário:", formErrors)
        const firstError = Object.values(formErrors)?.[0] as any
        toast.error(firstError?.message || 'Aconteceu algum erro! Confira todos os campos.')
    }

    if (isLoadingSpeaker && !currentSpeaker) {
        return (
            <section className="flex w-full justify-center items-center h-auto p-2 sm:p-4">
                <div className="w-full max-w-[720px] bg-surface-100 p-6 sm:p-8 border border-surface-300 rounded-2xl animate-pulse space-y-4">
                    <div className="h-6 w-48 bg-surface-300/60 rounded-md" />
                    <div className="h-10 w-full bg-surface-200 rounded-xl" />
                    <div className="h-10 w-full bg-surface-200 rounded-xl" />
                    <div className="h-10 w-full bg-surface-200 rounded-xl" />
                </div>
            </section>
        )
    }

    return (
        <section className="flex w-full justify-center items-center h-auto p-2 sm:p-4">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Atualizar orador</div>

                    <CheckboxBoolean
                        checked={speakerIsPublisher}
                        handleCheckboxChange={(checked) => {
                            setSpeakerIsPublisher(checked)
                            if (!checked) {
                                setSelectedPublisher(null)
                            }
                        }}
                        label="É um publicador local?"
                    />

                    {speakerIsPublisher && (
                        <div className='mt-3'>
                            <DropdownObject<IPublisher>
                                title="Publicador local"
                                items={speakerFormData?.publishers ?? []}
                                selectedItem={selectedPublisher}
                                handleChange={setSelectedPublisher}
                                labelKey="fullName"
                                border
                                textVisible
                                full
                                searchable
                                emptyMessage='Nenhum orador encontrado'
                            />
                        </div>
                    )}

                    {!speakerIsPublisher && (
                        <>
                            <Input
                                type="text"
                                placeholder="Nome completo"
                                registro={{
                                    ...register('fullName')
                                }}
                                invalid={errors?.fullName?.message ? 'invalido' : ''}
                            />
                            {errors?.fullName?.message && (
                                <span className="text-xs text-red-500 font-medium -mt-1.5 mb-2 ml-1">
                                    {errors.fullName.message}
                                </span>
                            )}

                            <Input
                                type="text"
                                placeholder="Endereço"
                                registro={{ ...register('address') }}
                                invalid={errors?.address?.message ? 'invalido' : ''}
                            />
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
                            {errors?.phone?.message && (
                                <span className="text-xs text-red-500 font-medium -mt-1.5 mb-2 ml-1">
                                    {errors.phone.message}
                                </span>
                            )}

                            <DropdownObject<ICongregation>
                                title="Congregação"
                                items={sortedCongregations}
                                selectedItem={selectedSpeakerCongregation}
                                handleChange={setSelectedSpeakerCongregation}
                                labelKey="name"
                                labelKeySecondary="city"
                                showSecondaryLabelOnSelected
                                border
                                textVisible
                                full
                                searchable
                                emptyMessage='Nenhuma congregação encontrada'
                            />
                        </>
                    )}

                    <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
                        <div className='flex flex-1 justify-between items-center'>
                            <span className='mb-2 text-xs font-semibold uppercase tracking-wider text-typography-600'>Selecionar discursos</span>
                        </div>
                        <DropdownMulti<ITalk>
                            title="Selecione os discursos"
                            itemKey="id"
                            items={speakerFormData?.talks ?? []}
                            selectedItems={selectedTalks ?? []}
                            handleChange={setSelectedTalks}
                            border
                            full
                            position="left"
                            labelKey="number"
                            labelKeySecondary='title'
                            textVisible
                            searchable
                            emptyMessage='Nenhum discurso encontrado'
                        />
                    </div>

                    <div className="flex justify-center items-center w-full mt-6">
                        <Button
                            className="w-full text-typography-200"
                            error={dataError}
                            disabled={disabled || isSubmitting}
                            success={dataSuccess}
                            type='submit'
                        >
                            {isSubmitting ? 'Atualizando orador...' : 'Atualizar orador'}
                        </Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}