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
                <div className={`w-full lg:w-11/12 h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-full  font-semibold text-2xl sm:text-3xl text-primary-200`}>Cadastro</div>
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
                            <EyeOffIcon onClick={() => setPasswordVisible(false)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        ) : (
                            <EyeIcon onClick={() => setPasswordVisible(true)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        )}
                    </Input>

                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}

                    <Input type={confirmPasswordVisible ? "text" : "password"} placeholder="Confirmar senha" registro={{ ...register('confirmPassword', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''}>
                        {confirmPasswordVisible ? (
                            <EyeOffIcon onClick={() => setConfirmPasswordVisible(false)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        ) : (
                            <EyeIcon onClick={() => setConfirmPasswordVisible(true)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        )}
                    </Input>
                    {errors?.confirmPassword?.type && <InputError type={errors.confirmPassword.type} field='confirmPassword' />}
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button className='text-typography-200' error={dataError} success={dataSuccess} disabled={disabled} type='submit' >Criar conta</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}