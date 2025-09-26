import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import CheckboxBoolean from '@/Components/CheckboxBoolean'
import { useCongregationContext } from '@/context/CongregationContext'
import { ICongregation, IPublisher, ITalk } from '@/entities/types'
import { useFetch } from '@/hooks/useFetch'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createSpeakerAtom } from '../../../atoms/speakerAtoms'
import FormStyle from '../FormStyle'
import { FormValues } from './type'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import DropdownObject from '@/Components/DropdownObjects'
import { sortArrayByProperty } from '@/functions/sortObjects'
import DropdownMulti from '@/Components/DropdownMulti'
import Button from '@/Components/Button'
import { createHospitalityGroupAtom } from '@/atoms/hospitalityGroupsAtoms'
import { CreateHospitalityGroupPayload } from '@/atoms/hospitalityGroupsAtoms/types'


export default function FormAddHospitalityGroup() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id
    const createHospitalityGroup = useSetAtom(createHospitalityGroupAtom)

    const { data: getPublishers } = useFetch<IPublisher[]>(`/publishers/congregationId/${congregation_id ?? ""}`)

    const [selectedPublisherHost, setSelectedPublisherHost] = useState<IPublisher | null>(null)
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<IPublisher[]>()

    const allPublishers = sortArrayByProperty(getPublishers ?? [], "fullName")

    // lista de hosts (remove quem já é membro)
    const hosts = allPublishers.filter(
        p => !selectedGroupMembers?.some(m => m.id === p.id)
    )

    // lista de membros (remove quem já é host)
    const members = allPublishers.filter(
        p => p.id !== selectedPublisherHost?.id
    )

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const schemaValidation = yup.object({
        name: yup.string().required()
    })


    const { register, reset, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: {
            name: '',
        },
        resolver: yupResolver(schemaValidation)
    })

    function onSubmit(data: FormValues) {
        const publisherHost_id = selectedPublisherHost?.id
        const member_ids = selectedGroupMembers?.map(m => m.id)

        const payload: CreateHospitalityGroupPayload = {
            name: data.name,
            publisherHost_id: publisherHost_id,
            member_ids
        }
        toast.promise(createHospitalityGroup(congregation_id ?? "", payload), {
            pending: 'Criando novo grupo de hospitalidade...',
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
                    <div className={`my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200`}>Novo grupo</div>

                    <Input type="text" placeholder="Nome do grupo" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <DropdownObject<IPublisher>
                        title="Anfitrião do grupo"
                        items={hosts}
                        selectedItem={selectedPublisherHost}
                        handleChange={setSelectedPublisherHost}
                        labelKey="fullName"
                        border
                        textVisible
                        full
                        textAlign='left'
                        searchable
                    />

                    <div className='mt-3'>
                        <DropdownMulti<IPublisher>
                            title="Selecione os membros"
                            items={members}
                            selectedItems={selectedGroupMembers ?? []}
                            handleChange={setSelectedGroupMembers}
                            border
                            full
                            position="left"
                            textAlign="left"
                            labelKey="fullName"
                            textVisible
                            searchable
                        />
                    </div>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button error={dataError} disabled={disabled} success={dataSuccess} type='submit'>Criar grupo</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}