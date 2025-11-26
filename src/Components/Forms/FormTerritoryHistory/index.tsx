import { atomTerritoryHistoryAction, buttonDisabled, errorFormSend, successFormSend, territoryHistoryToUpdate } from "@/atoms/atom"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import CheckboxUnique from "@/Components/CheckBoxUnique"
import { ConfirmDeleteModal } from "@/Components/ConfirmDeleteModal"
import DropdownObject from "@/Components/DropdownObjects"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { CreateTerritoryHistoryArgs, IFieldConductors, UpdateTerritoryHistoryArgs } from "@/types/territory"
import { IPublisher, WORKTYPESTERRITORY } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtom, useAtomValue } from "jotai"
import { EditIcon, Trash } from "lucide-react"
import moment from "moment"
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


export default function FormTerritoryHistory({ territoryHistory, onCreate, onUpdate, onDelete }: ITerritoryHiistoryFormProps) {
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
    const [fieldConductors, setFieldConductors] = useState<IFieldConductors[]>()
    const [selectedItem, setSelectedItem] = useState<IFieldConductors | null>(null)
    const [conductorManually, setConductorManually] = useState(false)
    const isEditing = territoryHistory && territoryHistory.id === territoryHistoryToUpdateId;
    const [assignmentDate, setAssignmentDate] = useState<string | null>(null)
    const [completionDate, setCompletionDate] = useState<string | null>(null)

    const { data } = useAuthorizedFetch<IFieldConductors[]>('/form-data?form=territoryHistory', {
        allowedRoles: ['ADMIN_CONGREGATION', 'TERRITORY_MANAGER']
    })

    useEffect(() => {
        if (territoryHistory && fieldConductors) {
            const found = fieldConductors.find(
                (item) => item.nickname === territoryHistory.caretaker || item.fullName === territoryHistory.caretaker
            )
            if (found) {
                setSelectedItem(found)
            }
        }
    }, [territoryHistory, fieldConductors])


    useEffect(() => {
        if (data) {
            const sorted = sortArrayByProperty(data, 'fullName')
            setFieldConductors(sorted)
        }
    }, [data])

    const validationSchema = yup.object({
        caretaker: yup.string().when([], {
            is: () => conductorManually === true,
            then: yup.string().required(),
            otherwise: yup.string().nullable(),
        }),
        work_type: yup.string().when([], {
            is: () => workType === "Outra",
            then: yup.string().required(),
        }),
    })

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: {
            caretaker: territoryHistory ? territoryHistory?.caretaker : "",
            work_type: territoryHistory ? String(territoryHistory.work_type || "") : ""
        },
        resolver: yupResolver(validationSchema)
    })

    const watchedWorkType = watch("work_type")

    useEffect(() => {
        if (workType === "Outra") {
            setWorkTypeInput(watchedWorkType || "");
        }
    }, [watchedWorkType, workType]);

    const handleCheckBoxConductorManually = (checked: boolean) => {
        setConductorManually(checked)
        setSelectedItem(null)
        if (!checked) {
            setValue("caretaker", "")
        }
    }

    const handleSelectChange = (item: IFieldConductors | null) => {
        setSelectedItem(item)
        setValue("caretaker", "")
    }

    useEffect(() => {
        if (territoryHistory?.work_type !== undefined) {
            !Object.values(WORKTYPESTERRITORY).includes(territoryHistory?.work_type as WORKTYPESTERRITORY) ? setWorkType("Outra") : setWorkType(territoryHistory.work_type)
        }
    }, [territoryHistory, setTerritoryHistoryToUpdateId, setTerritoryHistoryAction])

    const handleCheckboxWorkType = (selectedItems: string) => {
        setWorkType(selectedItems)
    }

    async function onSubmit(data: FormValues) {
        function getCaretakerName(item?: IPublisher | null, fallback?: string) {
            if (!item) return fallback ?? "";
            return item.nickname?.trim() ? item.nickname : item.fullName;
        }

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
                caretaker: getCaretakerName(selectedItem, data.caretaker),
                assignment_date: assignmentDate,
                completion_date: completionDate,
                work_type: data.work_type,
            }
            if (payload.caretaker === "") {
                toast.info("Selecione um dirigente de campo ou preencha o nome do dirigente manualmente.")
                return
            }
            if (!payload.assignment_date) {
                toast.info("Preencha a data de designação.")
                return
            }
            onUpdate && onUpdate(payload)
            setConductorManually(false)
        } else {
            const payload: CreateTerritoryHistoryArgs = {
                territory_id: territoryId,
                caretaker: getCaretakerName(selectedItem, data.caretaker),
                assignment_date: assignmentDate,
                completion_date: completionDate,
                work_type: data.work_type,
            }
            if (payload.caretaker === "") {
                toast.info("Selecione um dirigente de campo ou preencha o nome do dirigente manualmente.")
                return
            }
            if (!payload.assignment_date) {
                toast.info("Preencha a data de designação.")
                return
            }
            onCreate && onCreate(payload)
            setConductorManually(false)
        }
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    async function handleDelete(territoryHistory_id: string) {
        onDelete && onDelete({ territoryHistory_id })
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
                                    territoryHistory &&
                                        setTerritoryHistoryToUpdateId(territoryHistory.id)
                                    setAssignmentDate(territoryHistory.assignment_date)
                                    setCompletionDate(territoryHistory.completion_date || null)
                                    setTerritoryHistoryAction("update")
                                }}
                                outline
                                type="button"
                            >
                                <EditIcon />
                                Editar
                            </Button>
                            <ConfirmDeleteModal
                                onDelete={() => handleDelete(territoryHistory.id)}
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
                    <div className=" flex flex-col">
                        <div className="flex flex-col gap-2 mt-5">
                            {(isEditing || territoryHistoryAction === "create") && (
                                <CheckboxBoolean
                                    checked={conductorManually}
                                    handleCheckboxChange={handleCheckBoxConductorManually}
                                    label="Dirigente manualmente"
                                />
                            )}
                            {isEditing || territoryHistoryAction === "create" ? (
                                <>
                                    {!conductorManually ? (
                                        fieldConductors && (
                                            <div className="my-3">
                                                <DropdownObject<IFieldConductors>
                                                    title="Dirigente de Campo"
                                                    items={fieldConductors}
                                                    selectedItem={selectedItem}
                                                    handleChange={handleSelectChange}
                                                    labelKey="fullName"
                                                    border
                                                    textVisible
                                                    full
                                                    textAlign='left'
                                                    searchable
                                                />
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            <Input
                                                type="text"
                                                placeholder="Dirigente"
                                                registro={{
                                                    ...register('caretaker', {
                                                        required: 'Campo Obrigatório',
                                                    })
                                                }}
                                            />
                                            {errors?.caretaker?.type &&
                                                <InputError type={errors?.caretaker?.type} field='caretaker' />
                                            }
                                        </>
                                    )}
                                </>
                            ) : (
                                <Input
                                    readOnly
                                    disabled
                                    type="text"
                                    value={territoryHistory?.caretaker || ""}
                                />
                            )}
                        </div>

                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <Calendar
                            key="assignmentDate"
                            label={territoryHistory?.assignment_date ? moment(territoryHistory?.assignment_date).format("DD/MM/YYYY") : "Data da designação"}
                            disabled={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false}
                            titleHidden
                            full
                            handleDateChange={setAssignmentDate}
                            selectedDate={assignmentDate}
                        />

                        <Calendar
                            key="completionDate"
                            label={territoryHistory?.completion_date ? moment(territoryHistory?.completion_date).format("DD/MM/YYYY") : "Data da conclusão"}
                            disabled={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false}
                            full
                            handleDateChange={setCompletionDate}
                            selectedDate={completionDate}
                            titleHidden
                        />
                    </div>
                    <CheckboxUnique disabled={territoryHistory ? territoryHistory.id !== territoryHistoryToUpdateId : false} visibleLabel label="Tipo de trabalho" options={optionsCheckbox[0]} handleCheckboxChange={(selectedItems) => handleCheckboxWorkType(selectedItems)} checked={workType}>
                        {workType === "Outra" ? (
                            <div className="px-2">
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
                            </div>
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