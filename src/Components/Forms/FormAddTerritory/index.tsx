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
        }).then(() => {
            reset()
        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadedFile(event.target.files?.[0] ?? null)
    }

    return (
        <section className="flex w-full justify-center items-center h-full p-2 sm:p-4">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full flex flex-col">
                    <div className="form-title-modern">Adicionar território</div>

                    <Input type="text" placeholder="Nome" registro={{
                        ...register('name', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <div className="my-1">
                        <Dropdown selectedItem={selectedNumber} full border textVisible handleClick={option => handleClick(option)} title='Número do território' options={availableNumbers} />
                    </div>

                    <TextArea placeholder="Referência" registro={{ ...register('description', { required: "Campo obrigatório" }) }} invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    {uploadedFile && (
                        <div className="mt-4 mb-2 rounded-xl overflow-hidden border border-surface-300 shadow-xs">
                            {/* eslint-disable-next-line */}
                            <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded" className="w-full h-auto object-contain max-h-60" />
                        </div>
                    )}

                    <div className="my-3">
                        <label className="text-xs font-semibold text-typography-600 uppercase tracking-wider mb-2 block">
                            Mapa do Território (Imagem)
                        </label>
                        <input className="text-sm text-typography-700 w-full
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-semibold file:text-primary-200
                            file:bg-primary-200/10 hover:file:bg-primary-200/20
                            hover:file:cursor-pointer transition-all" type="file" name="image" id="image-congregation" onChange={handleUpload} />
                    </div>

                    <div className="flex justify-center items-center w-full mt-6">
                        <Button className="w-full text-typography-200" error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Criar Território</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
