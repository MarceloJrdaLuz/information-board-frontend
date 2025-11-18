import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import TextArea from '@/Components/TextArea'
import { useTerritoryContext } from '@/context/TerritoryContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue } from 'jotai'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import Dropdown from '@/Components/Dropdown'
import { useEffect, useState } from 'react'


export default function FormAddTerritory() {

    const { createTerritory, setUploadedFile, uploadedFile } = useTerritoryContext()
    const { territories } = useTerritoryContext()
    const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
    const [disabled, setDisabled] = useAtom(buttonDisabled)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const [selectedNumber, setSelectedNumber] = useState<string>()

    useEffect(() => {
        if (territories) {
            const existingNumbers = territories.map(territory => territory.number)
            const allNumbers = Array.from({ length: 50 }, (_, index) => (index + 1).toString())
            const availableNumbers = allNumbers.filter(number => !existingNumbers.includes(Number(number)))
            setAvailableNumbers(availableNumbers)
        }
    }, [territories])


    function handleClick(number: string) {
        setSelectedNumber(number)
    }

    const validationSchema = yup.object({
        name: yup.string().required(),
        description: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '',
            description: '',
        }, resolver: yupResolver(validationSchema)
    })

    const onSubmit = ({ name, description }: FormValues) => {
        toast.promise(createTerritory({
            name,
            number: Number(selectedNumber),
            description,
        }), {
            pending: "Criando território"
        })
        reset()
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadedFile(event.target.files?.[0] ?? null)
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Adicionar território</div>

                    <Input type="text" placeholder="Nome" registro={{
                        ...register('name', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Dropdown selectedItem={selectedNumber} textAlign='left' full border textVisible handleClick={option => handleClick(option)} title='Número do território' options={availableNumbers} />


                    <TextArea placeholder="Referência" registro={{ ...register('description', { required: "Campo obrigatório" }) }} invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    {uploadedFile && (
                        <div className="mt-4 mb-4">
                            {/* eslint-disable-next-line */}
                            <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded" style={{ maxWidth: '100%' }} />
                        </div>
                    )}

                    <input className="text-sm text-typography-700
            file:mr-5 file:py-3 file:px-10
            file:rounded-full file:border-0
            file:text-md file:font-semibold  file:text-typography-200 hover:file:text-typography-900
            file:bg-gradient-to-r file:bg-primary-200
            hover:file:cursor-pointer hover:file:opacity-80" type="file" name="image" id="image-congregation" onChange={handleUpload} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button className='text-typography-200' error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Criar Território</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
