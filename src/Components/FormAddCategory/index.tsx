import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import Input from '../Input'
import InputError from '../InputError'
import Button from '../Button'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { ICategory } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'


export default function FormAddCategory() {

    const [categories, setCategories] = useState<ICategory[]>()

    const { data, mutate } = useFetch<ICategory[]>('/category')

    useEffect(() => {
        setCategories(data)
    }, [data])

    const esquemaValidacao = yup.object({
        categoryName: yup.string().required(),
        categoryDescription: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            categoryName: '',
            categoryDescription: '',
        }, resolver: yupResolver(esquemaValidacao)
    })

    async function onSubmit(data: {categoryName: string, categoryDescription: string}) {
        await api.post('category', { name: data.categoryName, description: data.categoryDescription }).then(res => {
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
                        ...register('categoryName',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.categoryName?.message ? 'invalido' : ''} />
                    {errors?.categoryName?.type && <InputError type={errors.categoryName.type} field='categoryName' />}

                    <Input type="text" placeholder="Descrição" registro={{
                        ...register('categoryDescription',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.categoryDescription?.message ? 'invalido' : ''} />
                    {errors?.categoryDescription?.type && <InputError type={errors.categoryDescription.type} field='categoryDescription' />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 mt-[10%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Criar congregação' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}