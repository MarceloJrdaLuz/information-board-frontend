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


export default function FormForgotPassword() {

    const { forgotMyPassword } = useContext(AuthContext)

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
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <>
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 w-11/12 font-semibold text-2xl sm:text-3xl md:text-2xl text-blue-500`}>Digite o seu e-mail</div>
                    <p>Insira o e-mail que você deseja resetar a senha!</p>
                    <Input type="text" placeholder="Email" registro={{
                        ...register('email',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.email?.message ? 'invalido' : ''} />
                    {errors?.email?.type && <InputError type={errors.email.type} field='email' />}
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        {/* <div className={`flex justify-center items-center`}>
                        <input className='mr-1' type='checkbox' title='Mantenha-me conectado'></input>
                        <span className={`ml-2 text-sm sm:text-lg sm:ml-0`}>Mantenha-me conectado</span>
                    </div> */}
                        <Button type='submit'>Entrar</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}