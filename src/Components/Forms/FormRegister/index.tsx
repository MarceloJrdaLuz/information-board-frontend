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
import { passwordValidate } from '@/utils/validatePassword'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'


export default function FormRegister() {

    const { signUp } = useAuthContext()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [passwordVisible, setPasswordVisible] = useState(false)
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

    const esquemaValidacao = yup.object({
        email: yup.string().email().required(),
        password: yup.string().required().matches(passwordValidate),
        confirmPassword: yup.string().required().oneOf([yup.ref('password'), null])
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            fullName: '',
            password: '',
            confirmPassword: ''
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        toast.promise(signUp(data.email, data.password, data.fullName), {
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
        <>
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Cadastro</div>
                    <Input type="text" placeholder="Email" registro={{
                        ...register('email',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.email?.message ? 'invalido' : ''} />
                    {errors?.email?.type && <InputError type={errors.email.type} field='email' />}

                    <Input type="text" placeholder="Nome completo" registro={{
                        ...register('fullName',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.fullName?.message ? 'invalido' : ''} />
                    {errors?.fullName?.type && <InputError type={errors.fullName.type} field='fullName' />}

                    <Input type={passwordVisible ? "text" : "password"} placeholder="Senha" registro={{ ...register('password', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''} >
                        {passwordVisible ? (
                            <EyeOffIcon onClick={() => setPasswordVisible(false)} className='text-typography-400 hover:text-primary-200 transition-colors mr-2 cursor-pointer w-5 h-5' />
                        ) : (
                            <EyeIcon onClick={() => setPasswordVisible(true)} className='text-typography-400 hover:text-primary-200 transition-colors mr-2 cursor-pointer w-5 h-5' />
                        )}
                    </Input>

                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}

                    <Input type={confirmPasswordVisible ? "text" : "password"} placeholder="Confirmar senha" registro={{ ...register('confirmPassword', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''}>
                        {confirmPasswordVisible ? (
                            <EyeOffIcon onClick={() => setConfirmPasswordVisible(false)} className='text-typography-400 hover:text-primary-200 transition-colors mr-2 cursor-pointer w-5 h-5' />
                        ) : (
                            <EyeIcon onClick={() => setConfirmPasswordVisible(true)} className='text-typography-400 hover:text-primary-200 transition-colors mr-2 cursor-pointer w-5 h-5' />
                        )}
                    </Input>
                    {errors?.confirmPassword?.type && <InputError type={errors.confirmPassword.type} field='confirmPassword' />}
                    <div className="flex justify-center items-center w-full mt-6">
                        <Button className="w-full" error={dataError} success={dataSuccess} disabled={disabled} type='submit' >Criar conta</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}