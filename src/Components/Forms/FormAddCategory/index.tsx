import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { ICategory } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import Button from '@/Components/Button'


export default function FormAddCategory() {

    const [categories, setCategories] = useState<ICategory[]>()

    const { data, mutate } = useFetch<ICategory[]>('/categories')

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

    async function onSubmit(data: {name: string, description: string}) {
        await api.post('category', { name: data.name, description: data.description }).then(res => {
            toast.success("Categoria cadastrada com sucesso!")
            reset()
            mutate()
        }).catch(err => {
            const { response: { data: { message } } } = err
            if(message === "Category already exists") {
                toast.error('Essa cateogoria já foi criada')
            }
            if(message === "Description already exists") {
                toast.error('Essa descrição já está sendo usada')
            }
        })
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex  justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center mt-8`}>
                    <div className='p-2'>
                        <span className='text-primary-200'>Crie as categorias de documentos. Ex: Campo - Vai ter os arquivos relacionados a saidas de campo. Abaixo tem a lista das categorias já criadas</span>
                    </div>
                    <div className='flex flex-wrap pt-5'>
                        {categories?.map(category => <span className='flex justify-center items-center py-2 px-5 text-xs bg-gray-300 rounded-3xl m-1 w-fit' key={category.id}>{category.name}</span>)}
                    </div>
                    <div className={`my-6  w-11/12 font-semibold  sm:text-2xl text-primary-200`}>Adicionar nova categoria</div>

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

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 mt-[10%]`}>
                        <Button type='submit'>Criar Categoria</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}