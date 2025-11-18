import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import CardCongregation from '@/Components/CardCongregation'
import CheckboxUnique from '@/Components/CheckBoxUnique'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useCongregationContext } from '@/context/CongregationContext'
import { CongregationTypeEnum } from '@/types/types'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue } from 'jotai'
import Router from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './types'

export default function FormAddCongregation() {
    const {
        createCongregation, setUploadedFile,
        showCongregationCreated,
        congregationCreated
    } = useCongregationContext()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [congregationTypeCheckboxSelected, setCongregationTypeCheckboxSelected] = useState<CongregationTypeEnum>(CongregationTypeEnum.SYSTEM)
    const optionsCheckboxCongregationType = useState<string[]>(Object.values(CongregationTypeEnum))

    const esquemaValidacao = yup.object({
        name: yup.string().required(),
        number: yup.string().required(),//.matches(validacaoSenha)
        circuit: yup.string().required(),
        city: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '',
            number: '',
            circuit: '',
            city: '',
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        const payload = {
            name: data.name ?? "",
            number: data.number ?? "",
            circuit: data.circuit ?? "",
            city: data.city ?? "",
        }
        toast.promise(createCongregation(payload), {
            pending: "Criando nova congregação..."
        })
    }

    function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadedFile(event.target.files?.[0] ?? null)
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    const handleCheckboxCongregationType = (selectedItems: string) => {
        switch (selectedItems) {
            case "auxiliary":
                setCongregationTypeCheckboxSelected(CongregationTypeEnum.AUXILIARY)
                break;
            default:
                setCongregationTypeCheckboxSelected(CongregationTypeEnum.SYSTEM)
                break;
        }
    }

    return !showCongregationCreated ? (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Nova Congregação</div>
                    <Input type="text" placeholder="Nome da Congregação" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}
                    <Input type="text" placeholder="Número da congregação" registro={{
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

                    <div className='border border-typography-300 my-4 p-4'>
                        <CheckboxUnique visibleLabel checked={congregationTypeCheckboxSelected} label="Tipo" options={optionsCheckboxCongregationType[0]} handleCheckboxChange={(selectedItems) => handleCheckboxCongregationType(selectedItems)} />
                    </div>

                    <input className="text-sm text-grey-500
            file:mr-5 file:py-3 file:px-10
            file:rounded-full file:border-0
            file:text-md file:font-semibold  file:text-secondary-100 hover:file:text-typography-900
            file:bg-gradient-to-r file:bg-primary-200
            hover:file:cursor-pointer hover:file:opacity-80" type="file" name="image" id="image-congregation" onChange={handleUpload} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[15%]`}>
                        <Button className='text-typography-200' disabled={disabled} success={dataSuccess} error={dataError} type='submit' >Criar Congregação</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    ) : (
        <section className='flex flex-col  justify-center items-center transition ease-out'>
            {congregationCreated &&
                <CardCongregation
                    id={congregationCreated.id}
                    name={congregationCreated.name}
                    number={congregationCreated.number}
                    circuit={congregationCreated.circuit}
                    city={congregationCreated.city}
                    image_url={congregationCreated.image_url ?? ""}
                    type={congregationCreated.type}
                />
            }
            <span className='text-primary-200 hover:underline cursor-pointer' onClick={() => Router.push('/congregacoes')}>Voltar a todas as congregações</span>
        </section>
    )
}