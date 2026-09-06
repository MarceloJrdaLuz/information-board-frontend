import { buttonDisabled, errorFormSend, showModalEmergencyContact, successFormSend } from '@/atoms/atom'
import { createEmergencyContactAtom } from '@/atoms/emergencyContactAtoms'
import Button from '@/Components/Button'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { XSquareIcon } from 'lucide-react'
import Router from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import FormStyle from '../FormStyle'
import { FormValues } from './type'

interface FormAddEmergencyContactProps {
    congregation_id: string // ID da congregação para a qual o contato de emergência será adicionado
}

export default function FormAddEmergencyContact({ congregation_id }: FormAddEmergencyContactProps) {
    const createEmergencyContact = useSetAtom(createEmergencyContactAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const [modalEmergencyContactShow, setModalEmergencyContactShow] = useAtom(showModalEmergencyContact)

    const esquemaValidacao = yup.object({
        name: yup.string().required(),
        phone: yup.string().required(),
        relationship: yup.string(),
        isTj: yup.boolean().required()
    })

    const { register, handleSubmit, formState: { errors }, control, reset } = useForm({
        defaultValues: {
            name: '',
            phone: '',
            relationship: '',
            isTj: false
        },
        resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: FormValues) {
        toast.promise(createEmergencyContact({ ...data, congregation_id }), {
            pending: 'Criando contato de emergência...',
        }).then(() => {
            reset()
            Router.back()
        }).catch(err => {
            console.log(err)
        })
    }
    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit)}>
                <div className="w-full flex flex-col">
                    <div className='flex justify-between items-center mb-4 pb-3 border-b border-surface-300/80'>
                        <div className="form-title-modern !mb-0 border-b-0 !pb-0">
                            Contato de emergência
                        </div>
                        <XSquareIcon onClick={() => {
                            setModalEmergencyContactShow(false)
                            Router.back()
                        }} className="text-red-400 hover:text-red-500 cursor-pointer rounded-sm hover:scale-105 transition-all" />
                    </div>

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

                    <div className="w-full mt-6">
                        <Button className='w-full text-typography-200' error={dataError} success={dataSuccess} disabled={disabled} type="submit">
                            Criar contato
                        </Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
