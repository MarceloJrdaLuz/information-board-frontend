import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import { updateCleaningGroupAtom } from "@/atoms/cleaningGroupsAtoms"
import Button from "@/Components/Button"
import DropdownMulti from "@/Components/DropdownMulti"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IFormDataCleaningGroup } from "@/types/cleaning"
import { IPublisher } from "@/types/types"
import FormStyle from "../FormStyle"

interface Props {
    group_id: string
}

interface FormValues {
    name: string
}

export default function FormEditCleaningGroup({ group_id }: Props) {

    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id

    const updateCleaningGroup = useSetAtom(updateCleaningGroupAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const { data: formData } = useFetch<IFormDataCleaningGroup>(`/form-data?form=cleaningGroup`)
    const { data: groupData } = useFetch(`${API_ROUTES.CLEANING_GROUPS}/${group_id}`)

    const [selectedMembers, setSelectedMembers] = useState<IPublisher[]>([])

    useEffect(() => {
        if (groupData?.publishers) {
            setSelectedMembers(groupData.publishers)
        }
    }, [groupData])

    const publishersInGroups = new Set<string>()
    formData?.cleaningGroups?.forEach(g => {
        if (g.id !== group_id)
            g.publishers?.forEach((p: IPublisher) => publishersInGroups.add(p.id))
    })

    const allPublishers = sortArrayByProperty(formData?.publishers ?? [], "fullName")

    const availablePublishers = allPublishers
        .filter(p => !publishersInGroups.has(p.id))
        .map(p => selectedMembers.find(s => s.id === p.id) ?? p)

    const validation = yup.object({
        name: yup.string().required("Campo obrigatório"),
    })

    const { register, reset, handleSubmit, formState: { errors } } =
        useForm<FormValues>({
            resolver: yupResolver(validation),
            defaultValues: { name: groupData?.name ?? "" }
        })

    useEffect(() => {
        if (groupData?.name) {
            reset({ name: groupData.name })
        }
    }, [groupData, reset])

    function onSubmit(data: FormValues) {
        const payload = {
            name: data.name,
            publisherIds: selectedMembers.map(m => m.id)
        }

        toast.promise(updateCleaningGroup(group_id, payload), {
            pending: "Atualizando grupo de limpeza..."
        }).then(() => {

        }).catch(err => {
            console.log(err)
        })
    }

    function onError() {
        toast.error("Preencha todos os campos corretamente.")
    }

    return (
        <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="w-full h-fit flex-col justify-center items-center">
                <div className="my-6 m-auto w-11/12 font-semibold text-2xl sm:text-3xl text-primary-200">
                    Editar Grupo
                </div>

                <Input
                    type="text"
                    placeholder="Nome do grupo"
                    registro={{ ...register("name") }}
                    invalid={errors?.name?.message ? "invalido" : ""}
                />
                {errors?.name?.type && <InputError type={errors.name.type} field="name" />}

                <div className="mt-3">
                    <DropdownMulti<IPublisher>
                        title="Membros do grupo"
                        items={availablePublishers}
                        selectedItems={selectedMembers}
                        handleChange={setSelectedMembers}
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
                    <Button
                        className="text-typography-200"
                        error={dataError}
                        disabled={disabled}
                        success={dataSuccess}
                        type="submit"
                    >
                        Salvar alterações
                    </Button>
                </div>
            </div>
        </FormStyle>
    )
}
