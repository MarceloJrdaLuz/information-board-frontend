import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { selectedAuxiliaryCongregationAtom, updateAuxiliaryCongregationAtom } from '@/atoms/auxiliaryCongregationAtoms'
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

export default function FormEditCongregationAuxiliary() {
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const updateAuxiliaryCongregation = useSetAtom(updateAuxiliaryCongregationAtom)
    const selectedAuxiliaryCongregation = useAtomValue(selectedAuxiliaryCongregationAtom)


    const [dayMeetingPublic, setDayMeetingPublic] = useState<string>(selectedAuxiliaryCongregation?.dayMeetingPublic ?? "")
    const [generatedCongregationNumberFake, setGeneratedCongregationNumberFake] = useState(false)

    const validationSchema = yup.object({
        name: yup.string().required(),
        circuit: yup.string().required(),
        city: yup.string().required(),
        hourMeetingPublic: yup.string(),
    })

    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
        defaultValues: {
            name: selectedAuxiliaryCongregation?.name,
            circuit: selectedAuxiliaryCongregation?.circuit,
            number: selectedAuxiliaryCongregation?.number,
            city: selectedAuxiliaryCongregation?.city,
            hourMeetingPublic: selectedAuxiliaryCongregation?.hourMeetingPublic
        }, resolver: yupResolver(validationSchema)
    })

    function onSubmit(data: FormValues) {
        const payload = {
            name: data.name,
            number: data.number ?? "",
            circuit: data.circuit,
            city: data.city,
            dayMeetingPublic,
            hourMeetingPublic: data.hourMeetingPublic
        }
        toast.promise(updateAuxiliaryCongregation(selectedAuxiliaryCongregation?.id ?? "", payload), {
            pending: "Criando nova congregação..."
        })
        reset()
        setDayMeetingPublic("")
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
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Atualizar Congregação</div>
                    <Input type="text" placeholder="Nome da Congregação" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <CheckboxBoolean
                        checked={generatedCongregationNumberFake}
                        label="Gerar número fake"
                        handleCheckboxChange={handleCheckboxChange}
                    />

                    <Input type="text" placeholder="Nº da congregação (Real ou Fake)" registro={{
                        ...register('number', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.number?.message ? 'invalido' : ''} />
                    {errors?.number?.type && <InputError type={errors.number.type} field='number' />}

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

                    <Dropdown textAlign='left' selectedItem={dayMeetingPublic} handleClick={(option) => handleClickPublicDropdown(option)} options={Object.values(EndweekDays)} title='Dia da reunião do fim de semana' border full textVisible />

                    <Input type="time" placeholder="Horário fim de semana" registro={{
                        ...register('hourMeetingPublic')
                    }}
                        invalid={errors?.hourMeetingPublic?.message ? 'invalido' : ''} />
                    {errors?.hourMeetingPublic?.type && <InputError type={errors.hourMeetingPublic.type} field='hourMeetingPublic' />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[15%]`}>
                        <Button disabled={disabled} success={dataSuccess} error={dataError} type='submit' >Atualizar Congregação</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}