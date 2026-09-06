import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useFetch } from '@/hooks/useFetch'
import { useSubmit } from '@/hooks/useSubmitForms'
import { api } from '@/services/api'
import { ICategory } from '@/types/types'
import { messageErrorsSubmit, messageSuccessSubmit } from '@/utils/messagesSubmit'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'


export default function FormAddCategory() {

    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const [categories, setCategories] = useState<ICategory[]>()

    const { data, mutate } = useFetch<ICategory[]>('/categories')

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        setCategories(data)
    }, [data])

    const esquemaValidacao = yup.object({
        name: yup.string().required(),
        description: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '',
            description: '',
        }, resolver: yupResolver(esquemaValidacao)
    })

    async function onSubmit(data: { name: string, description: string }) {
        await api.post('/category', { name: data.name, description: data.description }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.categoryCreate)
            reset()
            mutate()
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === "Category already exists") {
                handleSubmitSuccess(messageErrorsSubmit.categoryAlreadyExists)
            }
            if (message === "Description already exists") {
                handleSubmitError(messageErrorsSubmit.categoryDescriptionAlreadyExists)
            }
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex  justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col">
                    <div className='p-3.5 bg-primary-200/5 border border-primary-200/20 rounded-xl mb-4 text-sm text-typography-500'>
                        <span className='text-typography-600 font-medium'>Crie as categorias de documentos. Ex: Campo - Vai ter os arquivos relacionados a saídas de campo. Abaixo tem a lista das categorias já criadas:</span>
                    </div>
                    {categories && categories.length > 0 && (
                        <div className='flex flex-wrap gap-1.5 mb-5'>
                            {categories.map(category => (
                                <span className='inline-flex items-center py-1.5 px-3.5 text-xs font-medium bg-surface-200 border border-surface-300 rounded-full text-typography-700 shadow-2xs' key={category.id}>
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="form-title-modern">Adicionar nova categoria</div>

                    <Input type="text" placeholder="Título da categoria" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Descrição" registro={{
                        ...register('description',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    <div className="w-full mt-6">
                        <Button className='w-full text-typography-200' disabled={disabled} success={dataSuccess} error={dataError} type='submit'>Criar Categoria</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}