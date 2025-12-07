import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import {
    createCleaningGroupAtom,
} from "@/atoms/cleaningGroupsAtoms"
import { CreateCleaningGroupPayload } from "@/atoms/cleaningGroupsAtoms/types"
import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IFormDataCleaningGroup } from "@/types/cleaning"
import { IPublisher } from "@/types/types"
import FormStyle from "../FormStyle"

interface FormValues {
    name: string
}

export default function FormAddCleaningGroup() {
    const { congregation } = useCongregationContext()
    const congregation_id = congregation?.id

    const createCleaningGroup = useSetAtom(createCleaningGroupAtom)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [selectedMembers, setSelectedMembers] = useState<IPublisher[]>([])
    const [availableNumbers, setAvailableNumbers] = useState<number[]>([])
    const [selectedNumber, setSelectedNumber] = useState<number>()


    const { data, mutate } = useFetch<IFormDataCleaningGroup>(`/form-data?form=cleaningGroup`)

    useEffect(() => {
        if (data) {
            const existingNumbers = data.cleaningGroups.map(group => group.order)
            const allNumbers = Array.from({ length: 15 }, (_, index) => (index + 1))
            const availableNumbers = allNumbers.filter(number => !existingNumbers.includes(number))
            setAvailableNumbers(availableNumbers)
        }
    }, [data])

    const publishersInGroups = new Set<string>()

    if (data) {
        data.cleaningGroups?.forEach(g => {
            g.publishers?.forEach((p: IPublisher) => publishersInGroups.add(p.id))
        })
    }

    const allPublishers = sortArrayByProperty(data?.publishers ?? [], "fullName")

    const availablePublishers = allPublishers
        .filter(p => !publishersInGroups.has(p.id))
        .map(p => selectedMembers.find(s => s.id === p.id) ?? p)

    const validation = yup.object({
        name: yup.string().required("Campo obrigatório"),
    })

    const { register, reset, handleSubmit, formState: { errors } } =
        useForm<FormValues>({
            defaultValues: { name: "" },
            resolver: yupResolver(validation)
        })

    async function onSubmit(data: FormValues) {

        if (!selectedNumber) {
            toast.info("É obrigatório escolher um número.")
            return
        }

        const payload: CreateCleaningGroupPayload = {
            name: data.name,
            order: selectedNumber,
            publisherIds: selectedMembers.map(m => m.id)
        }

        await toast.promise(createCleaningGroup(congregation_id ?? "", payload), {
            pending: "Criando novo grupo de limpeza..."
        }).then(() => {
            reset()
            mutate()
            setSelectedMembers([])
            setAvailableNumbers([])
            setSelectedNumber(undefined)
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
                    Novo Grupo de Limpeza
                </div>

                <Input
                    type="text"
                    placeholder="Nome do grupo"
                    registro={{ ...register("name") }}
                    invalid={errors?.name?.message ? "invalido" : ""}
                />
                {errors?.name?.type && (
                    <InputError type={errors.name.type} field="name" />
                )}

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
                <div className="mt-3">
                    <Dropdown selectedItem={selectedNumber?.toString()} textAlign='left' full border textVisible handleClick={option => setSelectedNumber(Number(option))} title='Número do grupo' options={availableNumbers.map(num => num.toString())} />
                </div>

                <div className="flex justify-center items-center m-auto w-11/12 h-12 my-[5%]">
                    <Button
                        className="text-typography-200"
                        error={dataError}
                        disabled={disabled}
                        success={dataSuccess}
                        type="submit"
                    >
                        Criar grupo
                    </Button>
                </div>
            </div>
        </FormStyle>
    )
}
