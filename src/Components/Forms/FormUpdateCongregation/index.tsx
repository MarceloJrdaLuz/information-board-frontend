import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Dropdown from '@/Components/Dropdown'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useCongregationContext } from '@/context/CongregationContext'
import { EndweekDays, MidweekDays } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './types'

export default function FormUpdateCongregation() {
    const { congregation: congregationUser, updateCongregation, setUploadedFile, uploadedFile } = useCongregationContext()
    const [dayMeetingLifeAndMinistary, setDayMeetingLifeAndMinistary] = useState(congregationUser?.dayMeetingLifeAndMinistary)
    const [dayMeetingPublic, setDayMeetingPublic] = useState(congregationUser?.dayMeetingPublic)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const esquemaValidacao = yup.object({
        name: yup.string().required(),
        circuit: yup.string().required(),
        city: yup.string().required(),
        hourMeetingLifeAndMinistary: yup.string(),
        hourMeetingPublic: yup.string(),
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: congregationUser?.name ?? "",
            circuit: congregationUser?.circuit ?? "",
            city: congregationUser?.city ?? "",
            hourMeetingLifeAndMinistary: congregationUser?.hourMeetingLifeAndMinistary?.slice(0, 5),
            hourMeetingPublic: congregationUser?.hourMeetingPublic?.slice(0, 5),
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        const {
            dayMeetingLifeAndMinistary: dayMeetingLifeAndMinistaryUpdated, hourMeetingLifeAndMinistary, dayMeetingPublic: dayMeetingPublicUpdated,
            hourMeetingPublic, name, city, circuit
        } = data

        const updateCongregationBody = {
            name,
            city,
            circuit,
            hourMeetingLifeAndMinistary,
            hourMeetingPublic,
            dayMeetingLifeAndMinistary: dayMeetingLifeAndMinistaryUpdated ?? dayMeetingLifeAndMinistary,
            dayMeetingPublic: dayMeetingPublicUpdated ?? dayMeetingPublic,
        }

        toast.promise(updateCongregation(congregationUser?.id ?? "", updateCongregationBody), {
            pending: "Atualizando congregação"
        })
        reset()
    }

    function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadedFile(event.target.files?.[0] ?? null)
    }

    function handleClickLifeAndMinistaryDropdown(option: string) {
        setDayMeetingLifeAndMinistary(option)
    }

    function handleClickPublicDropdown(option: string) {
        setDayMeetingPublic(option)
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <>
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-9/12 flex-col justify-center items-center `}>
                    <div className={`my-6 w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>{`Atualizar congregação ${congregationUser?.name} (${congregationUser?.number})`}</div>

                    <Input type="text" placeholder="Nome da Congregação" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Cidade" registro={{
                        ...register('city', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.city?.message ? 'invalido' : ''} />
                    {errors?.city?.type && <InputError type={errors.city.type} field='city' />}

                    <Input type="text" placeholder="Circuito" registro={{
                        ...register('circuit', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.circuit?.message ? 'invalido' : ''} />
                    {errors?.circuit?.type && <InputError type={errors.circuit.type} field='circuit' />}

                    <Dropdown textAlign='left' selectedItem={dayMeetingLifeAndMinistary} handleClick={(option) => handleClickLifeAndMinistaryDropdown(option)} options={Object.values(MidweekDays)} title='Dia da reunião do meio de semana' border full textVisible />

                    <Input type="time" placeholder="Horário meio de semana" registro={{
                        ...register('hourMeetingLifeAndMinistary')
                    }}
                        invalid={errors?.hourMeetingLifeAndMinistary?.message ? 'invalido' : ''} />
                    {errors?.hourMeetingLifeAndMinistary?.type && <InputError type={errors.hourMeetingLifeAndMinistary.type} field='hourMeetingLifeAndMinistary' />}

                    <Dropdown textAlign='left' selectedItem={dayMeetingPublic} handleClick={(option) => handleClickPublicDropdown(option)} options={Object.values(EndweekDays)} title='Dia da reunião do fim de semana' border full textVisible />


                    <Input type="time" placeholder="Horário fim de semana" registro={{
                        ...register('hourMeetingPublic')
                    }}
                        invalid={errors?.hourMeetingPublic?.message ? 'invalido' : ''} />
                    {errors?.hourMeetingPublic?.type && <InputError type={errors.hourMeetingPublic.type} field='hourMeetingPublic' />}

                    {congregationUser?.image_url && <div className='w-full mb-4'>
                        <span>Foto Atual</span>
                        <Image src={`${congregationUser?.image_url}`} alt="Foto atual da congregação" width={400} height={400} />
                    </div>}

                    {uploadedFile && (
                        <div className="mt-4 mb-4">
                            Nova foto
                            {/* eslint-disable-next-line */}
                            <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded" style={{ maxWidth: '100%' }} />
                        </div>
                    )}

                    <input
                        className="text-sm text-grey-500
            file:mr-5 file:py-3 file:px-10
            file:rounded-full file:border-0
            file:text-md file:font-semibold  file:text-secondary-100 hover:file:text-typography-900
            file:bg-gradient-to-r file:bg-primary-200
            hover:file:cursor-pointer hover:file:opacity-80"
                        type="file"
                        name="image"
                        id="image-congregation"
                        onChange={handleUpload}
                    />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[15%]`}>
                        <Button error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Atualizar Congregação</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}