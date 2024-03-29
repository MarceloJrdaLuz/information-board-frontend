import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { ICongregation } from '@/entities/types'
import { useCongregationContext } from '@/context/CongregationContext'
import Router from 'next/router'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'
import CardCongregation from '@/Components/CardCongregation'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'




export default function FormAddCongregation() {
    const {
        createCongregation, setUploadedFile,
        showCongregationCreated, setShowCongregationCreated,
        congregationCreated, setModalNewCongregation
    } = useCongregationContext()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

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

    function onSubmit(data: ICongregation) {
        const { name, number, circuit, city, } = data
        toast.promise(createCongregation(name, number!, circuit, city), {
            pending: "Criando nova congregação..."
        })
    }

    function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadedFile(event.target.files?.[0] ?? null)
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
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

                    <input className="text-sm text-grey-500
            file:mr-5 file:py-3 file:px-10
            file:rounded-full file:border-0
            file:text-md file:font-semibold  file:text-secondary-100 hover:file:text-black
            file:bg-gradient-to-r file:bg-primary-200
            hover:file:cursor-pointer hover:file:opacity-80" type="file" name="image" id="image-congregation" onChange={handleUpload} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[15%]`}>
                        <Button disabled={disabled} success={dataSuccess} error={dataError} type='submit' >Criar Congregação</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    ) : (
        <section className='flex flex-col  justify-center items-center transition ease-out'>
            {congregationCreated && <CardCongregation name={congregationCreated.name}
                number={congregationCreated.number}
                circuit={congregationCreated.circuit}
                city={congregationCreated.city}
                image_url={congregationCreated.image_url ?? ""}
            />}
            <span className='text-primary-200 hover:underline cursor-pointer' onClick={() => Router.push('/congregacoes')}>Voltar a todas as congregações</span>
        </section>
    )
}