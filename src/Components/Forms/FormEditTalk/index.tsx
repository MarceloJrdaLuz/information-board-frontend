import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { selectedTalkAtom, updateTalkAtom } from '@/atoms/talksAtoms'
import Button from '@/Components/Button'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues } from './type'


export default function FormEditTalk() {
    const updateTalk = useSetAtom(updateTalkAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const selectedTalk = useAtomValue(selectedTalkAtom)

    const schemaValidation = yup.object({
        number: yup.number().required(),
        title: yup.string().required(),
    })


    const { register, reset, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: {
            number: selectedTalk?.number ?? 1,
            title: selectedTalk?.title ?? ""
        },
        resolver: yupResolver(schemaValidation)
    })

    function onSubmit(data: FormValues) {
        const payload = {
            number: data.number ?? selectedTalk?.number,
            title: data.title ?? selectedTalk?.title
        }

        toast.promise(updateTalk(selectedTalk?.id ?? "", payload), {
            pending: 'Atualizando discurso...',
        })
        reset()
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar discurso</div>

                    <>
                        <Input type="number" placeholder="Número" registro={{
                            ...register('number',
                                { required: "Campo obrigatório" })
                        }}
                            invalid={errors?.number?.message ? 'invalido' : ''} />
                        {errors?.number?.type && <InputError type={errors.number.type} field='number' />}

                        <Input type="text" placeholder="Tema" registro={{ ...register('title') }} invalid={errors?.title?.message ? 'invalido' : ''} />
                        {errors?.title?.type && <InputError type={errors.title.type} field='title' />}
                    </>
                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button className='text-typography-200' error={dataError} disabled={disabled} success={dataSuccess} type='submit'>Atualizar discurso</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}