import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { createAuxiliaryCongregationAtom } from '@/atoms/auxiliaryCongregationAtoms'
import Button from '@/Components/Button'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import Dropdown from '@/Components/Dropdown'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { EndweekDays } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './types'
import { CreateAuxiliaryCongregationPayload } from '@/atoms/auxiliaryCongregationAtoms/types'

export default function FormAddCongregationAuxiliary() {
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const createAuxiliaryCongregation = useSetAtom(createAuxiliaryCongregationAtom)

    const [dayMeetingPublic, setDayMeetingPublic] = useState<EndweekDays>()
    const [generatedCongregationNumberFake, setGeneratedCongregationNumberFake] = useState(false)


    const validationSchema = yup.object({
        name: yup.string().required(),
        circuit: yup.string().required(),
        city: yup.string().required(),
        address: yup.string().transform((value) => value === "" ? undefined : value),
        latitude: yup
            .string()
            .transform((value) => {
                const trimmed = value?.trim() ?? ""
                return trimmed === "" ? undefined : trimmed
            })
            .nullable()
            .notRequired(),

        longitude: yup
            .string()
            .transform((value) => {
                const trimmed = value?.trim() ?? ""
                return trimmed === "" ? undefined : trimmed
            })
            .nullable()
            .notRequired(),
        hourMeetingPublic: yup.string().required(),
    })

    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
        defaultValues: {
            name: '',
            circuit: '',
            number: '',
            city: '',
            address: '',
            latitude: '',
            longitude: '',
            hourMeetingPublic: ''
        }, resolver: yupResolver(validationSchema)
    })

    function onSubmit(data: FormValues) {
        const payload: CreateAuxiliaryCongregationPayload = {
            name: data.name,
            number: data.number ?? "",
            circuit: data.circuit,
            city: data.city,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            dayMeetingPublic: dayMeetingPublic ?? "",
            hourMeetingPublic: data.hourMeetingPublic
        }
        if (!dayMeetingPublic) {
            toast.info('Por favor, selecione o dia da reunião do fim de semana.')
            return
        }
        toast.promise(createAuxiliaryCongregation(payload), {
            pending: "Criando nova congregação..."
        }).then(() => {
            reset()
            setDayMeetingPublic(undefined)
        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleClickPublicDropdown(option: string) {
        switch (option) {
            case "Sexta-feira":
                setDayMeetingPublic(EndweekDays.SEXTA)
                break;
            case "Sábado":
                setDayMeetingPublic(EndweekDays.SABADO)
                break;
            default:
                setDayMeetingPublic(EndweekDays.DOMINGO)
                break;
        }
    }

    function generateCongregationNumber() {
        return Math.floor(10000 + Math.random() * 90000).toString()
    }

    function handleCheckboxChange(isChecked: boolean) {
        setGeneratedCongregationNumberFake(isChecked)
        if (isChecked) {
            setValue("number", generateCongregationNumber()) // gera número automático
        } else {
            setValue("number", "") // limpa o campo
        }
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Nova Congregação</div>
                    <Input type="text" placeholder="Nome da Congregação*" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <div className="my-2">
                        <CheckboxBoolean
                            checked={generatedCongregationNumberFake}
                            label="Gerar número fake"
                            handleCheckboxChange={handleCheckboxChange}
                        />
                    </div>

                    <Input type="text" placeholder="Nº da congregação*" registro={{
                        ...register('number', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.number?.message ? 'invalido' : ''} />
                    {errors?.number?.type && <InputError type={errors.number.type} field='number' />}

                    <Input type="text" placeholder="Cidade*" registro={{
                        ...register('city', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.city?.message ? 'invalido' : ''} />
                    {errors?.city?.type && <InputError type={errors.city.type} field='city' />}

                    <Input type="text" placeholder="Circuito*" registro={{
                        ...register('circuit', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.circuit?.message ? 'invalido' : ''} />
                    {errors?.circuit?.type && <InputError type={errors.circuit.type} field='circuit' />}

                    <Input type="text" placeholder="Endereço" registro={{
                        ...register('address')
                    }}
                        invalid={errors?.address?.message ? 'invalido' : ''} />
                    {errors?.address?.type && <InputError type={errors.address.type} field='address' />}

                    <Input type="text" placeholder="Latitude" registro={{
                        ...register('latitude')
                    }}
                        invalid={errors?.latitude?.message ? 'invalido' : ''} />
                    {errors?.latitude?.type && <InputError type={errors.latitude.type} field='latitude' />}

                    <Input type="text" placeholder="Longitude" registro={{
                        ...register('longitude')
                    }}
                        invalid={errors?.longitude?.message ? 'invalido' : ''} />
                    {errors?.longitude?.type && <InputError type={errors.longitude.type} field='longitude' />}

                    <div className="my-2">
                        <Dropdown selectedItem={dayMeetingPublic} handleClick={(option) => handleClickPublicDropdown(option)} options={Object.values(EndweekDays)} title='Dia da reunião do fim de semana*' border full textVisible />
                    </div>

                    <Input type="time" placeholder="Horário da reunião*" registro={{
                        ...register('hourMeetingPublic')
                    }}
                        invalid={errors?.hourMeetingPublic?.message ? 'invalido' : ''} />
                    {errors?.hourMeetingPublic?.type && <InputError type={errors.hourMeetingPublic.type} field='hourMeetingPublic' />}

                    <div className="w-full mt-6">
                        <Button className='w-full text-typography-200' disabled={disabled} success={dataSuccess} error={dataError} type='submit' >Criar Congregação</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}