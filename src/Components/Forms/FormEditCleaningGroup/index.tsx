import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import { updateCleaningGroupAtom } from "@/atoms/cleaningGroupsAtoms"
import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IFormDataCleaningGroup } from "@/types/cleaning"
import { IPublisher, PrivilegeCode } from "@/types/types"
import { hasPrivilege } from "@/functions/publisherPrivilegeHelper"
import FormStyle from "../FormStyle"

interface Props {
    group_id: string
}

interface FormValues {
    name?: string
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
    const [selectedDayPreference, setSelectedDayPreference] = useState<string>("ALL")

    const DAY_PREFERENCE_OPTIONS = [
        { value: "ALL", label: "Qualquer reunião (Ambos - padrão)" },
        { value: "MIDWEEK", label: "Apenas Meio de Semana" },
        { value: "WEEKEND", label: "Apenas Fim de Semana" },
    ]

    useEffect(() => {
        if (groupData?.publishers) {
            const valid = groupData.publishers.filter((p: IPublisher) => hasPrivilege(p, PrivilegeCode.PUBLISHER))
            setSelectedMembers(valid)
        }
        if (groupData?.dayPreference) {
            setSelectedDayPreference(groupData.dayPreference)
        }
    }, [groupData])

    const publishersInGroups = new Set<string>()
    formData?.cleaningGroups?.forEach(g => {
        if (g.id !== group_id)
            g.publishers?.forEach((p: IPublisher) => publishersInGroups.add(p.id))
    })

    const validPublishers = (formData?.publishers ?? []).filter(p => hasPrivilege(p, PrivilegeCode.PUBLISHER))
    const allPublishers = sortArrayByProperty(validPublishers, "fullName")

    const availablePublishers = allPublishers
        .filter(p => !publishersInGroups.has(p.id))
        .map(p => selectedMembers.find(s => s.id === p.id) ?? p)

    const validation = yup.object({
        name: yup.string().optional(),
    })

    const isCurrentNameDefault = groupData?.name && /^grupo\s*\d+$/i.test(groupData.name.trim())

    const { register, reset, handleSubmit, formState: { errors } } =
        useForm<FormValues>({
            resolver: yupResolver(validation),
            defaultValues: { name: isCurrentNameDefault ? "" : (groupData?.name ?? "") }
        })

    useEffect(() => {
        if (groupData?.name) {
            const isDefault = /^grupo\s*\d+$/i.test(groupData.name.trim())
            reset({ name: isDefault ? "" : groupData.name })
        }
    }, [groupData, reset])

    function onSubmit(data: FormValues) {
        const trimmed = data.name?.trim()
        const finalName = trimmed || `Grupo ${groupData?.order || ""}`

        const payload = {
            name: finalName,
            dayPreference: selectedDayPreference,
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
            <div className="w-full flex flex-col">
                <div className="form-title-modern">
                    Editar Grupo de Limpeza
                </div>

                {groupData?.order && (
                    <div className="p-3 bg-surface-200/50 border border-surface-300 rounded-xl mb-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-typography-600">
                            Número do Grupo (Ordem):
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary-200/10 text-primary-200">
                            Grupo {groupData.order}
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <Input
                        type="text"
                        placeholder={`Nome personalizado (opcional - padrão: "Grupo ${groupData?.order || ''}")`}
                        registro={{ ...register("name") }}
                        invalid={errors?.name?.message ? "invalido" : ""}
                    />
                    {errors?.name?.type && <InputError type={errors.name.type} field="name" />}
                    <span className="text-[11px] text-typography-500">
                        Deixe em branco para usar o número sequencial padrão ("Grupo {groupData?.order || ''}").
                    </span>
                </div>

                <div className="mt-4">
                    <DropdownMulti<IPublisher>
                        title="Membros do grupo"
                        items={availablePublishers}
                        selectedItems={selectedMembers}
                        handleChange={setSelectedMembers}
                        border
                        full
                        position="left"
                        labelKey="fullName"
                        textVisible
                        searchable
                        emptyMessage="Nenhum publicador encontrado"
                    />
                </div>

                <div className="mt-4">
                    <Dropdown
                        title="Disponibilidade nas Reuniões"
                        options={DAY_PREFERENCE_OPTIONS.map(o => o.label)}
                        selectedItem={DAY_PREFERENCE_OPTIONS.find(o => o.value === selectedDayPreference)?.label}
                        handleClick={label => {
                            const found = DAY_PREFERENCE_OPTIONS.find(o => o.label === label)
                            if (found) setSelectedDayPreference(found.value)
                        }}
                        full
                        border
                        textVisible
                    />
                </div>

                <div className="w-full mt-6">
                    <Button
                        className="w-full text-typography-200"
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
