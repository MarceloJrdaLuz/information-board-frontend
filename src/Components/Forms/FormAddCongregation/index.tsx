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
        }).then(() => {
            
        }).catch(err => {
            console.log(err)
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
        <section className="flex w-full justify-center items-center h-full p-2 sm:p-4">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Nova Congregação</div>
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

                    <div className='border border-surface-300 rounded-xl bg-surface-200/20 my-3.5 p-4 shadow-xs'>
                        <CheckboxUnique visibleLabel checked={congregationTypeCheckboxSelected} label="Tipo" options={optionsCheckboxCongregationType[0]} handleCheckboxChange={(selectedItems) => handleCheckboxCongregationType(selectedItems)} />
                    </div>

                    <div className="my-3">
                        <label className="text-xs font-semibold text-typography-600 uppercase tracking-wider mb-2 block">
                            Imagem da Congregação
                        </label>
                        <input className="text-sm text-typography-700 w-full
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-semibold file:text-primary-200
                            file:bg-primary-200/10 hover:file:bg-primary-200/20
                            hover:file:cursor-pointer transition-all" type="file" name="image" id="image-congregation" onChange={handleUpload} />
                    </div>

                    <div className="flex justify-center items-center w-full mt-6">
                        <Button className="w-full text-typography-200" disabled={disabled} success={dataSuccess} error={dataError} type='submit' >Criar Congregação</Button>
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