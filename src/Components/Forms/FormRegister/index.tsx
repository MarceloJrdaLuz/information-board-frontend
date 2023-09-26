import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { FormValues } from './type'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'


export default function FormRegister() {

    const { signUp } = useContext(AuthContext)

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
        toast.promise(signUp(data.email, data.password), {
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
                    <div className={`my-6 m-auto w-full  font-semibold text-2xl sm:text-3xl text-primary-200`}>Cadastro</div>
                    <Input type="text" placeholder="Email" registro={{
                        ...register('email',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.email?.message ? 'invalido' : ''} />
                    {errors?.email?.type && <InputError type={errors.email.type} field='email' />}
                    <Input type="password" placeholder="Senha" registro={{ ...register('password', { required: "Campo obrigatório" }) }} invalid={errors?.password?.message ? 'invalido' : ''} />
                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button type='submit' >Criar conta</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}