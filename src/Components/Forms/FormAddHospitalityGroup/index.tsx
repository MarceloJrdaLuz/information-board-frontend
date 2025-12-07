import { yupResolver } from '@hookform/resolvers/yup'
import { useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'

import { buttonDisabled, errorFormSend, successFormSend } from '@/atoms/atom'
import { createHospitalityGroupAtom } from '@/atoms/hospitalityGroupsAtoms'
import { CreateHospitalityGroupPayload } from '@/atoms/hospitalityGroupsAtoms/types'
import Button from '@/Components/Button'
import DropdownMulti from '@/Components/DropdownMulti'
import DropdownObject from '@/Components/DropdownObjects'
import Input from '@/Components/Input'
import InputError from '@/Components/InputError'
import { useCongregationContext } from '@/context/CongregationContext'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { useFetch } from '@/hooks/useFetch'
import { IFormDataHospitalityGroup } from '@/types/hospitality'
import { IPublisher } from '@/types/types'
import FormStyle from '../FormStyle'
import { FormValues } from './type'

export default function FormAddHospitalityGroup() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id

    const createHospitalityGroup = useSetAtom(createHospitalityGroupAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [selectedPublisherHost, setSelectedPublisherHost] = useState<IPublisher | null>(null)
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<IPublisher[]>([])
    const { data } = useFetch<IFormDataHospitalityGroup>(`/form-data?form=hospitalityGroup`)

    const publishersInGroups = new Set<string>()

    data?.hospitalityGroups?.forEach(group => {
        if (group.host) publishersInGroups.add(group.host.id)
        group.members?.forEach((m: IPublisher) => publishersInGroups.add(m.id))
    })

    const allPublishers = sortArrayByProperty(data?.publishers ?? [], "fullName")
    const hosts = allPublishers?.filter(p =>
        // exclui quem já está em grupo 
        !publishersInGroups.has(p.id) &&

        // não pode ser membro já selecionado
        !selectedGroupMembers?.some(m => m.id === p.id)
    )

    const members = allPublishers.filter(p =>
        // exclui o host atual
        p.id !== selectedPublisherHost?.id &&

        // exclui quem está em outro grupo que não é o atual
        !publishersInGroups.has(p.id)
    ).map(p => {
        const selected = selectedGroupMembers?.find(m => m.id === p.id)
        return selected ?? p
    })

    const schemaValidation = yup.object({
        name: yup.string().required()
    })

    const { register, reset, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: { name: '' },
        resolver: yupResolver(schemaValidation)
    })

    function onSubmit(data: FormValues) {
        const payload: CreateHospitalityGroupPayload = {
            name: data.name,
            publisherHost_id: selectedPublisherHost?.id,
            member_ids: selectedGroupMembers.map(m => m.id)
        }

        toast.promise(createHospitalityGroup(congregation_id ?? "", payload), {
            pending: 'Criando novo grupo de hospitalidade...',
        }).then(() => {
            reset()
            setSelectedPublisherHost(null)
            setSelectedGroupMembers([])
        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="w-full h-fit flex-col justify-center items-center">
                    <div className="my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200">
                        Novo grupo
                    </div>

                    <Input
                        type="text"
                        placeholder="Nome do grupo"
                        registro={{ ...register('name', { required: "Campo obrigatório" }) }}
                        invalid={errors?.name?.message ? 'invalido' : ''}
                    />
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
                            selectedItems={selectedGroupMembers}
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

                    <div className="flex justify-center items-center m-auto w-11/12 h-12 my-[5%]">
                        <Button className='text-typography-200' error={dataError} disabled={disabled} success={dataSuccess} type='submit'>
                            Criar grupo
                        </Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}
