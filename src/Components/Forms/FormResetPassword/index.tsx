import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '@/context/AuthContext'
import { IFormResetPassword } from './type'
import { useRouter } from 'next/router'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'
import { useAtomValue } from 'jotai'
import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { passwordValidate } from '@/utils/validatePassword'


export default function FormResetPassword() {

    const router = useRouter()

    const { token, email } = router.query

    const { resetPassword } = useAuthContext()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [passwordVisible, setPasswordVisible] = useState(false)
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

    const esquemaValidacao = yup.object({
        password: yup.string().required().matches(passwordValidate),
        confirmPassword: yup.string().required().oneOf([yup.ref('password'), null])
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
                    <div className={`my-6 w-11/12 font-semibold text-2xl sm:text-3xl md:text-2xl text-primary-200`}>Nova senha</div>
                    <p>Insira abaixo a nova senha!</p>
                    <Input type={passwordVisible ? "text" : "password"} placeholder="Senha" registro={{
                        ...register('password',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.password?.message ? 'invalido' : ''} >
                        {passwordVisible ? (
                            <EyeOffIcon onClick={() => setPasswordVisible(false)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        ) : (
                            <EyeIcon onClick={() => setPasswordVisible(true)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        )}
                    </Input>
                    {errors?.password?.type && <InputError type={errors.password.type} field='password' />}
                    <Input type={confirmPasswordVisible ? "text" : "password"} placeholder="Repetir Senha" registro={{
                        ...register('confirmPassword',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.confirmPassword?.message ? 'invalido' : ''} >
                        {confirmPasswordVisible ? (
                            <EyeOffIcon onClick={() => setConfirmPasswordVisible(false)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        ) : (
                            <EyeIcon onClick={() => setConfirmPasswordVisible(true)} className='text-primary-200 hover:opacity-80 mr-2 cursor-pointer' />
                        )}
                    </Input>
                    {errors?.confirmPassword?.type && <InputError type={errors.confirmPassword.type} field='confirmPassword' />}
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button className='text-typography-200' error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Resetar senha</Button>
                    </div>
                </div>
            </FormStyle>
        </>
    )
}