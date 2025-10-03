import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Dropdown from '@/Components/Dropdown'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import TextArea from '@/Components/TextArea'
import { API_ROUTES } from '@/constants/apiRoutes'
import { useTerritoryContext } from '@/context/TerritoryContext'
import { useFetch } from '@/hooks/useFetch'
import { ITerritory } from '@/types/territory'
import { useAtom, useAtomValue } from 'jotai'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import FormStyle from '../FormStyle'
import { FormValues, IUpdateTerritory } from './type'



export default function FormEditTerritory({ territory_id }: IUpdateTerritory) {
    const { data } = useFetch<ITerritory>(`${API_ROUTES.TERRITORY}/${territory_id}`)
    const { territories } = useTerritoryContext()

    const [selectedNumber, setSelectedNumber] = useState<string>()
    const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
    const { updateTerritory, setUploadedFile, uploadedFile } = useTerritoryContext()
    const [territoryUpdated, setTerritoryUpdated] = useState<ITerritory | undefined>(data)
    const [disabled, setDisabled] = useAtom(buttonDisabled)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)

    useEffect(() => {
        if (territories) {
            const existingNumbers = territories.map(territory => territory.number)
            const allNumbers = Array.from({ length: 50 }, (_, index) => (index + 1).toString())
            const availableNumbers = allNumbers.filter(number => !existingNumbers.includes(Number(number)))
            setAvailableNumbers(availableNumbers)
        }
    }, [territories])

    const formMethods = useForm<FormValues>({
        defaultValues: data || { // Set default values to the fetched data or empty values
            name: "",
            description: ""
        },
    })

    const { register, reset, handleSubmit, formState: { errors }, setValue } = formMethods

    // Track the initial form values in state
    const [initialFormValues, setInitialFormValues] = useState<FormValues | null>(null)

    // Watch the form values for changes
    const watchedFormValues = formMethods.watch()

    useEffect(() => {
        if (data) {
            setTerritoryUpdated(data)
            setSelectedNumber(data.number.toString())
        }
    }, [data])

    useEffect(() => {
        if (territoryUpdated) {
            reset({
                name: territoryUpdated.name || '',
                description: territoryUpdated.description || ''
            })
        }
    }, [territoryUpdated, reset])

    function handleClick(number: string) {
        setSelectedNumber(number)
    }

    const onSubmit = ({ name, description}: FormValues) => {
        toast.promise(updateTerritory({
            name,
            number: Number(selectedNumber),
            description, 
            territory_id
        }), {
            pending: "Atualizando território"
        })
        reset()
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadedFile(event.target.files?.[0] ?? null)
    }
  
    useEffect(() => {
        if (data) {
            // Set initial form values when data is available
            setInitialFormValues({
                name: data.name || '',
                description: data.description || '',
            })
        }
    }, [data])

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar território</div>

                    <Input type="text" placeholder="Nome" registro={{
                        ...register('name', { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Dropdown selectedItem={selectedNumber} textAlign='left' full border textVisible handleClick={option => handleClick(option)} title='Número do território' options={availableNumbers} />


                    <TextArea placeholder="Referência" registro={{ ...register('description', { required: "Campo obrigatório" }) }} invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}

                    {territoryUpdated?.image_url && <div className='w-full mb-4'>
                        <span>Foto Atual</span>
                        <Image src={`${territoryUpdated?.image_url}`} alt="Foto atual do território" width={400} height={400} />
                    </div>}

                    {uploadedFile && (
                        <div className="mt-4 mb-4">
                            Nova foto
                            {/* eslint-disable-next-line */}
                            <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded" style={{ maxWidth: '100%' }} />
                        </div>
                    )}

                    <input className="text-sm text-grey-500
            file:mr-5 file:py-3 file:px-10
            file:rounded-full file:border-0
            file:text-md file:font-semibold  file:text-secondary-100 hover:file:text-black
            file:bg-gradient-to-r file:bg-primary-200
            hover:file:cursor-pointer hover:file:opacity-80" type="file" name="image" id="image-congregation" onChange={handleUpload} />

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} success={dataSuccess} disabled={disabled} type='submit'>Atualizar Território</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
