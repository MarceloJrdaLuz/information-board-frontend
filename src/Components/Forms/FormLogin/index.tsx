import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Spiner from '@/Components/Spiner'
import { useAuthContext } from '@/context/AuthContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue } from 'jotai'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './type'


export default function FormLogin() {

    const { login, loading } = useAuthContext()
     const router = useRouter()

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

    async function onSubmit(data: FormValues) {
        try {
            await toast.promise(login(data.email, data.password), {
                pending: "Autenticando..."
            })

            // se tiver callbackUrl, redireciona pra lá
            if (router.query.callbackUrl) {
                router.push(router.query.callbackUrl as string)
            } else {
                router.push("/dashboard") // padrão
            }
        } catch {
            toast.error("Erro ao autenticar")
        }
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <>
            {!loading ? (
                <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                    <div className="w-full flex flex-col">
                        <div className="form-title-modern">Login</div>
                        <Input type="text" placeholder="Email" registro={{
                            ...register('email',
                                { required: "Campo obrigatório" })
                        }}
                            invalid={errors?.email?.message ? 'invalido' : ''} />
                        {errors?.email?.type && <InputError type={errors.email.type} field='email' />}

                        <Input type={passwordVisible ? "text" : "password"} placeholder="Senha" registro={{ ...register('password', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''} >
                            {passwordVisible ? (
                                <EyeOffIcon onClick={() => setPasswordVisible(false)} className='text-typography-400 hover:text-primary-200 transition-colors mr-2 cursor-pointer w-5 h-5' />
                            ) : (
                                <EyeIcon onClick={() => setPasswordVisible(true)} className='text-typography-400 hover:text-primary-200 transition-colors mr-2 cursor-pointer w-5 h-5' />
                            )}
                        </Input>
                        {errors?.password?.type && <InputError type={errors.password.type} field='password' />}

                        <div className="flex justify-center items-center w-full mt-6">
                            <Button className="w-full text-typography-200" error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Entrar</Button>
                        </div>

                        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-surface-300/60 text-center">
                            <Link href={'/forgot-password'} className='text-primary-200 hover:underline text-sm font-medium'>
                                Esqueci minha senha
                            </Link>
                            <Link href={'/cadastro'} className='text-typography-600 hover:text-primary-200 text-sm font-medium'>
                                Não tem uma conta? <span className="text-primary-200 font-semibold underline">Criar nova conta</span>
                            </Link>
                        </div>
                    </div>
                </FormStyle>
            ) : (
                <Spiner />
            )}
        </>
    )
}