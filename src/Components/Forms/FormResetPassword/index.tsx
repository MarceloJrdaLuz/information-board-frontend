import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { IFormResetPassword } from './type'
import { useRouter } from 'next/router'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'


export default function FormResetPassword() {

    const router = useRouter()

    const { token, email } = router.query

    const { forgotMyPassword, resetPassword } = useContext(AuthContext)

    const esquemaValidacao = yup.object({
        password: yup.string().required(),
        confirmPassword: yup.string().oneOf([yup.ref('password')], 'Senhas não conferem').required()
    })

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            password: '',
            confirmPassword: ''
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: IFormResetPassword) {
        toast.promise(resetPassword(email?.toString(), token?.toString(), data.password), {
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
                    <div className={`my-6 w-11/12 font-semibold text-2xl sm:text-3xl md:text-2xl text-blue-500`}>Nova senha</div>
                    <p>Insira abaixo a nova senha!</p>
                    <Input type="text" placeholder="Senha" registro={{
                        ...register('password',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.password?.message ? 'invalido' : ''} />
                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}
                    <Input type="text" placeholder="Repetir Senha" registro={{
                        ...register('confirmPassword',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.confirmPassword?.message ? 'invalido' : ''} />
                    {errors?.confirmPassword?.type && <InputError type={errors.confirmPassword.type} field='confirmPassword' />}
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button type='submit'>Resetar senha</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}