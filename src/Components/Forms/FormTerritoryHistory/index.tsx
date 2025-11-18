import { atomTerritoryHistoryAction, buttonDisabled, errorFormSend, successFormSend, territoryHistoryToUpdate } from "@/atoms/atom"
import Button from "@/Components/Button"
import CheckboxUnique from "@/Components/CheckBoxUnique"
import { ConfirmDeleteModal } from "@/Components/ConfirmDeleteModal"
import { useAuthContext } from "@/context/AuthContext"
import { useTerritoryContext } from "@/context/TerritoryContext"
import { CreateTerritoryHistoryArgs, UpdateTerritoryHistoryArgs } from "@/types/territory"
import { WORKTYPESTERRITORY } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtom, useAtomValue } from "jotai"
import { EditIcon, Trash } from "lucide-react"
import 'moment/locale/pt-br'
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import Input from "../../Input"
import InputError from "../../InputError"
import FormStyle from "../FormStyle"
import { FormValues, ITerritoryHiistoryFormProps } from "./types"
import { mutate } from "swr"


export default function FormTerritoryHistory({ territoryHistory }: ITerritoryHiistoryFormProps) {
    const { createTerritoryHistory, updateTerritoryHistory, deleteTerritoryHistory } = useTerritoryContext()
    const router = useRouter()
    const { territory_id } = router.query
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)
    const [workType, setWorkType] = useState("Padrão")
    const [territoryHistoryToUpdateId, setTerritoryHistoryToUpdateId] = useAtom(territoryHistoryToUpdate)
    const [territoryHistoryAction, setTerritoryHistoryAction] = useAtom(atomTerritoryHistoryAction)
    const [workTypeInput, setWorkTypeInput] = useState("")
    const optionsCheckbox = useState<string[]>(Object.values(WORKTYPESTERRITORY))

    const validationSchema = yup.object({
        caretaker: yup.string().required(),
        assignment_date: yup.date().required(),
        completion_date: yup.date().nullable(),
        work_type: yup.string().when([], {
            is: () => workType === "Outra",
            then: yup.string().required(),
        }),
    })

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        defaultValues: {
            caretaker: territoryHistory ? territoryHistory?.caretaker : "",
            assignment_date: territoryHistory ? territoryHistory?.assignment_date : null,
            completion_date: territoryHistory ? territoryHistory?.completion_date : null,
            work_type: territoryHistory ? String(territoryHistory.work_type || "") : ""
        },
        resolver: yupResolver(validationSchema)
    })

    const watchedWorkType = watch("work_type")

    useEffect(() => {
        if (workType === "Outra") {
            setWorkTypeInput(watchedWorkType || ""); // Atualiza o estado com o valor monitorado
        }
    }, [watchedWorkType, workType]);

    useEffect(() => {
        if (territoryHistory?.work_type !== undefined) {
            !Object.values(WORKTYPESTERRITORY).includes(territoryHistory?.work_type as WORKTYPESTERRITORY) ? setWorkType("Outra") : setWorkType(territoryHistory.work_type)
        }
    }, [territoryHistory, setTerritoryHistoryToUpdateId, setTerritoryHistoryAction])

    const handleCheckboxWorkType = (selectedItems: string) => {
        setWorkType(selectedItems)
    }

    async function onSubmit(data: FormValues) {
        const territoryId = typeof territory_id === 'string' ? territory_id : ''

        switch (workType) {
            case "Outra":
                data.work_type = workTypeInput
                break;
            default:
                data.work_type = workType
                break;
        }

        if (territoryHistoryAction === "update") {
            const payload: UpdateTerritoryHistoryArgs = {
                territoryHistory_id: territoryHistoryToUpdateId,
                territory_id: territoryId,
                caretaker: data.caretaker,
                assignment_date: data.assignment_date,
                completion_date: data.completion_date,
                work_type: data.work_type,
            }
            toast.promise(updateTerritoryHistory(payload), {
                pending: 'Atualizando histórico do território...',
            })
        } else {
            const payload: CreateTerritoryHistoryArgs = {
                territory_id: territoryId,
                caretaker: data.caretaker,
                assignment_date: data.assignment_date,
                completion_date: data.completion_date,
                work_type: data.work_type,
            }
            toast.promise(createTerritoryHistory(payload), {
                pending: 'Criando histórico do território...'
            })
        }
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    async function onDelete(territoryHistory_id: string, territory_id: string) {
        deleteTerritoryHistory({
            territoryHistory_id,
            territory_id
        })
    }

    return (
        <section className="w-80 m-5">
            <FormStyle full onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-auto flex-col justify-center items-center`}>
                    {territoryHistory && <div className="w-full flex ">
                        <div className="w-full flex justify-between">
                            <Button
                                className="w-30"
                                onClick={() => {
                                    territoryHistory && setTerritoryHistoryToUpdateId(territoryHistory.id),
                                        setTerritoryHistoryAction("update")
                                }}
                                outline
                                type="button"
                            >
                                <EditIcon />
                                Editar
                            </Button>
                            <ConfirmDeleteModal
                                onDelete={() => onDelete(`${territoryHistory.id}`, `${territoryHistory.territory.id}`)}
                                button={
                                    <Button
                                        type="button"
                                        outline
                                        className="text-red-400 w-30"
                                    >
                                        <Trash />
                                        Excluir
                                    </Button>}
                            />
                        </div>

                    </div>
                    }
                    <Input
                        readOnly={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false}
                        type={"text"}
                        placeholder={territoryHistory ? territoryHistory.caretaker : "Dirigente"}
                        registro={{
                            ...register('caretaker', {
                                required: 'Campo Obrigatório'
                            })
                        }}
                    />
                    {errors?.caretaker?.type && <InputError type={errors?.caretaker?.type} field='caretaker' />}
                    <Input
                        readOnly={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false}
                        type="date"
                        placeholder={territoryHistory?.assignment_date ?? "Data da designação"}
                        registro={{
                            ...register('assignment_date')
                        }}
                        invalid={errors?.assignment_date?.message ? 'invalido' : ''}
                    />
                    {errors?.assignment_date?.type && <InputError type={errors?.assignment_date?.type} field='assignment_date' />}
                    <Input
                        readOnly={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false}
                        type="date"
                        placeholder={territoryHistory?.completion_date ?? "Data da conclusão"}
                        maxLength={50}
                        registro={{
                            ...register('completion_date')
                        }}
                        invalid={errors?.completion_date?.message ? 'invalido' : ''}
                    />
                    {errors?.completion_date?.type && <InputError type={errors?.completion_date?.type} field='completion_date' />}

                    <CheckboxUnique disabled={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false} visibleLabel label="Tipo de trabalho" options={optionsCheckbox[0]} handleCheckboxChange={(selectedItems) => handleCheckboxWorkType(selectedItems)} checked={workType}>
                        {workType === "Outra" ? (
                            <>
                                <Input
                                    readOnly={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false}
                                    type={"text"}
                                    placeholder="Outra"
                                    registro={{
                                        ...register('work_type', {
                                            required: 'Campo Obrigatório'
                                        })
                                    }}
                                    invalid={errors?.work_type?.message ? 'invalido' : ''}
                                />
                                {errors?.work_type?.type && <InputError type={errors?.work_type?.type} field='work_type' />}
                            </>
                        ) : null}
                    </CheckboxUnique>

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 sm:my-[5%]`}>
                        <Button
                            className="text-typography-200"
                            size="lg"
                            disabled={disabled}
                            error={dataError}
                            success={dataSuccess}
                            type='submit'
                        >Enviar</Button>
                    </div>
                </div>
            </FormStyle>
        </section >
    )
}