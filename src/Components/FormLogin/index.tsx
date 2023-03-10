import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import Input from '../Input'
import InputError from '../InputError'
import Link from 'next/link'
import Button from '../Button'
import { useForm } from 'react-hook-form'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'


export default function FormLogin() {

    const { login } = useContext(AuthContext)

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
        // await api.post('/login', {
        //     email: data.email,
        //     password: data.senha
        // }).then(res => {
        //     const resposta =  {
        //         user: res.data.user,
        //         token: res.data.token
        //     }
        //    console.log(resposta)
        // }).catch(res => {
        //     console.log(res)
        // })
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
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-blue-500`}>Login</div>
                    <Input type="text" placeholder="Email" registro={{
                        ...register('email',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.email?.message ? 'invalido' : ''} />
                    {errors?.email?.type && <InputError type={errors.email.type} field='email' />}
                    <Input type="password" placeholder="Senha" registro={{ ...register('password', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''} />
                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}
                    <div>
                        <div>
                            <Link href={'/forgot-password'} className='text-principais-primary hover:underline text-center text-sm sm:text-lg'>
                                Esqueci minha senha
                            </Link>
                        </div>
                        <div>
                            <Link href={'/cadastro'} className='text-principais-primary hover:underline text-center text-sm sm:text-lg'>
                                Criar nova conta
                            </Link>
                        </div>
                    </div>
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        {/* <div className={`flex justify-center items-center`}>
                        <input className='mr-1' type='checkbox' title='Mantenha-me conectado'></input>
                        <span className={`ml-2 text-sm sm:text-lg sm:ml-0`}>Mantenha-me conectado</span>
                    </div> */}
                        <Button color='bg-blue-500' hoverColor='bg-button-hover' title='Entrar' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </>
    )
}