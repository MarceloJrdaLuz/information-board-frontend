import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '@/context/AuthContext'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'


export default function FormLogin() {

    const { login } = useAuthContext()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [passwordVisible, setPasswordVisible] = useState(false)

    const esquemaValidacao = yup.object({
        email: yup.string().email().required(),
        password: yup.string().required()//.matches(validacaoSenha)
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        toast.promise(login(data.email, data.password), {
            pending: 'Autenticando...',
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <>
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full lg:w-11/12 h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-full  font-semibold text-2xl sm:text-3xl text-primary-200`}>Login</div>
                    <Input type="text" placeholder="Email" registro={{
                        ...register('email',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.email?.message ? 'invalido' : ''} />
                    {errors?.email?.type && <InputError type={errors.email.type} field='email' />}

                    <Input type={passwordVisible ? "text" : "password"} placeholder="Senha" registro={{ ...register('password', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''} >
                    {passwordVisible ? (
                            <EyeOffIcon onClick={() => setPasswordVisible(false)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        ) : (
                            <EyeIcon onClick={() => setPasswordVisible(true)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        )}
                    </Input>
                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}
                    <div>
                        <div>
                            <Link href={'/forgot-password'} className='text-primary-200  hover:underline text-center text-sm sm:text-lg'>
                                Esqueci minha senha
                            </Link>
                        </div>
                        <div>
                            <Link href={'/cadastro'} className='text-primary-200  hover:underline text-center text-sm sm:text-lg'>
                                Criar nova conta
                            </Link>
                        </div>
                    </div>
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Entrar</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}