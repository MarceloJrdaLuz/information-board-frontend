import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import Button from '@/Components/Button'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useSubmitContext } from '@/context/SubmitFormContext'
import { IEmergencyContact } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import { messageErrorsSubmit, messageSuccessSubmit } from '@/utils/messagesSubmit'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'react-toastify'
import CheckboxBoolean from '../CheckboxBoolean'
import { FormValues } from './type'
import FormStyle from '../Forms/FormStyle'

export interface IEmergencyContactProps {
    emergencyContact: string
}

export default function FormEditEmergencyContact({ emergencyContact }: IEmergencyContactProps) {
    const { data } = useFetch<IEmergencyContact>(`/emergencyContact/${emergencyContact}`)
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const [emergencyContactToUpdate, setEmergencyContactToUpdate] = useState<IEmergencyContact>()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const [disabled, setDisabled] = useAtom(buttonDisabled)


    const formMethods = useForm<FormValues>({
        defaultValues: { // Manually set default values here
            name: '',
            phone: '',
            relationship: '',
            isTj: false
        },
    })

    const validationSchema = yup.object({
        name: yup.string().required(),
        phone: yup.string().required(),
        relationship: yup.string().required(),
        isTj: yup.boolean().required()
    })

    // Create a ref to track the initial form values
    const initialFormValues = useRef<FormValues | null>(null)

    // Watch the form values for changes
    const watchedFormValues = useWatch({ control: formMethods.control })


    const { register, reset, handleSubmit, formState: { errors }, control } = useForm<FormValues>({
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        if (data) {
            setEmergencyContactToUpdate(data)

            if (!initialFormValues.current) {
                // Set initial form values when data is available and when initialFormValues is not set yet
                initialFormValues.current = {
                    name: data.name || '',
                    phone: data.phone || '',
                    relationship: data.relationship || '',
                    isTj: data.isTj || false

                }
                // Set default values manually here
                formMethods.reset(initialFormValues.current)
            }
        }
    }, [data, formMethods])

    useEffect(() => {
        if (emergencyContactToUpdate) {
            reset({
                name: emergencyContactToUpdate.name || '',
                phone: emergencyContactToUpdate.phone || '',
                relationship: emergencyContactToUpdate.relationship || '',
                isTj: emergencyContactToUpdate.isTj || false
            })
        }
    }, [emergencyContactToUpdate, reset])

    useEffect(() => {
        if (initialFormValues.current) {
            const isFormChanged = JSON.stringify(watchedFormValues) !== JSON.stringify(initialFormValues.current)
        }
    }, [watchedFormValues, initialFormValues, setDisabled])

    async function updateEmergencyContact({ emergencyContact_id, name, phone, relationship, isTj }: { emergencyContact_id: string, name?: string, phone?: string, relationship?: string, isTj?: boolean }) {
        await api.put(`/emergencyContact/${emergencyContact_id}`, {
            name,
            phone,
            relationship,
            isTj
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.emergencyContactUpdate, '/congregacao/contatos-emergencia')
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    const onSubmit = (data: FormValues) => {
        toast.promise(
            updateEmergencyContact({
                emergencyContact_id: emergencyContact,
                name: data.name,
                phone: data.phone,
                relationship: data.relationship,
                isTj: data.isTj
            }),
            {
                pending: 'Atualizando contato de emergência...'
            })
    }
    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Atualizar contato de emergência</div>

                    <Input
                        type="text"
                        placeholder="Nome completo"
                        registro={{ ...register('name') }}
                        invalid={errors?.name?.message ? 'invalido' : ''}
                    />
                    {errors?.name?.type && <InputError type={errors.name.type} field="name" />}

                    <Input
                        type="text"
                        placeholder="Relacionamento"
                        registro={{ ...register('relationship') }}
                        invalid={errors?.relationship?.message ? 'invalido' : ''}
                    />
                    {errors?.relationship?.type && <InputError type={errors.relationship.type} field="relationship" />}

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <Input type="tel" placeholder="Telefone" mask="(99) 99999-9999" {...field} />
                        )}
                    />
                    {errors?.phone?.type && <InputError type={errors.phone.type} field="phone" />}

                    <Controller
                        name="isTj"
                        control={control}
                        render={({ field }) => (
                            <CheckboxBoolean
                                checked={field.value}
                                handleCheckboxChange={(check) => field.onChange(check)}
                                label="É Testemunha de Jeová?"
                            />
                        )}
                    />
                    {errors?.isTj && <InputError type={errors.isTj.type} field="isTj" />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 mt-[10%]`}>
                        <Button disabled={disabled} success={dataSuccess} error={dataError} type='submit'>Atualizar Categoria</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}