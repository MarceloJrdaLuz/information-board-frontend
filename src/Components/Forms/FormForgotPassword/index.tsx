import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '@/context/AuthContext'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'


export default function FormForgotPassword() {

    const { forgotMyPassword } = useAuthContext()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const esquemaValidacao = yup.object({
        email: yup.string().email().required(),
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        toast.promise(forgotMyPassword(data.email), {
            pending: 'Autenticando...',
        }).then(() => {

        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="w-full flex flex-col">
                <div className="form-title-modern">
                    <div>Digite o seu e-mail</div>
                    <p className='text-typography-500 text-xs sm:text-sm font-normal mt-1'>Insira o e-mail cadastrado para recuperar seu acesso.</p>
                </div>

                <Input type="text" placeholder="Email" registro={{
                    ...register('email',
                        { required: "Campo obrigatório" })
                }}
                    invalid={errors?.email?.message ? 'invalido' : ''} />
                {errors?.email?.type && <InputError type={errors.email.type} field='email' />}
                <div className="flex justify-center items-center w-full mt-6">
                    <Button className="w-full" error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Enviar link</Button>
                </div>
            </div>
        </FormStyle>
    )
}