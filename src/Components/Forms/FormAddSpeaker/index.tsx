import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import DropdownMulti from '@/Components/DropdownMulti'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { ICongregation, IPublisher, ITalk } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createSpeakerAtom } from '../../../atoms/speakerAtoms'
import FormStyle from '../FormStyle'
import { FormValues, SpeakerFormData } from './type'


export default function FormAddSpeaker() {
    const createSpeaker = useSetAtom(createSpeakerAtom)

    const { data: speakerFormData } = useFetch<SpeakerFormData>(`/form-data?form=speaker`)
    const sortedCongregations = sortArrayByProperty(speakerFormData?.congregations ?? [], "name")

    const [speakerIsPublisher, setSpeakerIsPublisher] = useState<boolean>(false)
    const [selectedTalks, setSelectedTalks] = useState<ITalk[] | null>(null)
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)
    const [selectedSpeakerCongregation, setSelectedSpeakerCongregation] = useState<ICongregation | null>(null)


    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const { register, reset, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: {
            fullName: '',
            address: '',
            phone: ''
        },
        resolver: yupResolver(speakerIsPublisher
            ? yup.object({}) // nada required se for publisher
            : yup.object({
                fullName: yup.string().required('Campo obrigatório'),
                phone: yup
                    .string()
                    .nullable()
                    .notRequired()
                    .test('is-valid-phone', 'Telefone inválido', value => {
                        if (!value) return true; // aceita vazio
                        return /^\(\d{2}\) \d{5}-\d{4}$/.test(value); // valida formato se preenchido
                    }),
                address: yup.string().notRequired()
            }))
    })

    function onSubmit(data: FormValues) {
        const congregationId = !speakerIsPublisher
            ? selectedSpeakerCongregation?.id
            : selectedPublisher?.congregation.id

        if (!congregationId) {
            toast.error("Selecione uma congregação.")
            return
        }
        const publisherId = speakerIsPublisher ? selectedPublisher?.id : undefined
        const talk_ids = selectedTalks?.map(talk => talk.id)
        toast.promise(createSpeaker({
            fullName: !speakerIsPublisher ? data.fullName : selectedPublisher?.fullName ?? '',
            originCongregation_id: congregationId,
            publisher_id: publisherId,
            address: !speakerIsPublisher ? data.address : selectedPublisher?.address,
            phone: !speakerIsPublisher ? data.phone : selectedPublisher?.phone,
            talk_ids
        }), {
            pending: 'Criando novo orador',
        }).then(() => {
            reset()
            setSelectedTalks(null)
            setSelectedSpeakerCongregation(null)
            setSelectedPublisher(null)
            setSpeakerIsPublisher(false)
        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Novo orador</div>

                    <CheckboxBoolean
                        checked={speakerIsPublisher}
                        handleCheckboxChange={setSpeakerIsPublisher}
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
                            />
                        </div>
                    )}

                    {!speakerIsPublisher && <>
                        <Input type="text" placeholder="Nome completo" registro={{
                            ...register('fullName',
                                { required: "Campo obrigatório" })
                        }}
                            invalid={errors?.fullName?.message ? 'invalido' : ''} />
                        {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

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

                        <DropdownObject<ICongregation>
                            title="Congregação"
                            items={sortedCongregations}
                            selectedItem={selectedSpeakerCongregation}
                            handleChange={setSelectedSpeakerCongregation}
                            labelKey="name"
                            labelKeySecondary='city'
                            border
                            textVisible
                            full
                            searchable
                        />
                    </>}

                    <div className='border border-typography-300 my-4 p-4'>
                        <div className='flex flex-1 justify-between items-center'>
                            <span className='my-2 font-semibold text-typography-900'>Selecionar discursos</span>
                        </div>
                        <DropdownMulti<ITalk>
                            title="Selecione os discursos"
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

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button className='text-typography-200' error={dataError} disabled={disabled} success={dataSuccess} type='submit'>Criar orador</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}