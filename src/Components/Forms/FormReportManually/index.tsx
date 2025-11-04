import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import CheckboxUnique from "@/Components/CheckBoxUnique"
import { ConfirmDeleteModal } from "@/Components/ConfirmDeleteModal"
import { usePublisherContext } from "@/context/PublisherContext"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { IPayloadCreateReportManually } from "@/types/reports"
import { IPublisher, IReports, Privileges, PrivilegesMinistry } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { Trash } from "lucide-react"
import 'moment/locale/pt-br'
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import Input from "../../Input"
import InputError from "../../InputError"
import FormStyle from "../FormStyle"
import { FormValues } from "./types"

interface IRelatorioFormProps {
    report: IReports | null
    publisher: IPublisher | null
}

export default function FormReportManually({ report, publisher }: IRelatorioFormProps) {
    const { createReportManually, deleteReport } = usePublisherContext()
    const router = useRouter()
    const { month } = router.query
    const monthParam = month as string

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [privilege, setPrivilege] = useState<string>(Privileges.PUBLICADOR)
    const optionsCheckboxPrivilege = useState<string[]>(Object.values(PrivilegesMinistry))

    const validationSchema = yup.object({
        month: yup.string().required(),
        hours: yup.number(),
        studies: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        observations: yup.string()
    })

    const { register, handleSubmit, formState: { errors }, setValue, setError, clearErrors, resetField } = useForm({
        defaultValues: {
            month: '',
            hours: report?.hours,
            studies: "",
            observations: ""
        },
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        setValue('month', capitalizeFirstLetter(monthParam))
        setValue('hours', privilege !== "Publicador" ? report?.hours : 0)
        if (report?.studies) {
            setValue('studies', report?.studies.toString())
        }
        setValue('observations', report?.observations ?? "")
    }, [report, monthParam, setValue, privilege])

    const handleCheckboxPrivilege = (selectedItems: string) => {
        setPrivilege(selectedItems)
    }

    async function onDelete(report_id: string) {
        await toast.promise(deleteReport(report_id), {
            pending: "Excluindo relatório..."
        })
    }

    async function onSubmit({ hours, month, observations, studies }: FormValues) {
        const splitMonth = month.split(' ')
        const payload: IPayloadCreateReportManually = {
            hours: hours ?? 0,
            month: splitMonth[0],
            year: splitMonth[1],
            observations,
            publisher: {
                id: publisher?.id ?? "",
                privileges: [privilege]
            },
            studies: Number(studies)
        }
        console.log(publisher, payload)
        // toast.promise(
        //     createReportManually(payload),
        //     {
        //         pending: 'Autenticando...'
        //     }
        // )
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex flex-col justify-center items-center">
            <div className="w-full flex justify-end pr-6 max-w-[600px]">
                {report && (
                    <ConfirmDeleteModal
                        onDelete={() => onDelete(`${report && report.id}`)}
                        button={
                            <Button
                                outline
                                className="text-red-400 w-30"
                            >
                                <Trash />
                                Excluir
                            </Button>
                        }
                    />
                )}
            </div>
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-auto flex-col justify-center items-center`}>
                    <Input
                        readOnly
                        type="text"
                        placeholder={monthParam}
                        registro={{
                            ...register('month', { required: "Campo obrigatório" }),
                        }}
                    />

                    <CheckboxUnique visibleLabel checked={privilege} label="" options={optionsCheckboxPrivilege[0]} handleCheckboxChange={(selectedItems) => handleCheckboxPrivilege(selectedItems)} />


                    <Input
                        type={privilege !== 'Publicador' ? 'text' : 'number'}
                        placeholder="Horas"
                        registro={{
                            ...register('hours', {
                                required: 'Campo Obrigatório'
                            })
                        }}
                        invalid={errors?.hours ? 'invalido' : ''}
                        readOnly={privilege === 'Publicador'}
                    />
                    {errors?.hours?.type && <InputError type={errors?.hours?.type} field='hours' />}

                    <Input
                        type="number"
                        placeholder="Estudos"
                        registro={{
                            ...register('studies')
                        }}
                        invalid={errors?.studies?.message ? 'invalido' : ''}
                    />
                    {errors?.studies?.type && <InputError type={errors?.studies?.type} field='studies' />}

                    <Input
                        type="text"
                        placeholder="Observações"
                        maxLength={50}
                        registro={{
                            ...register('observations')
                        }}
                        invalid={errors?.observations?.message ? 'invalido' : ''}
                    />
                    {errors?.observations?.type && <InputError type={errors?.observations?.type} field='observations' />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 sm:my-[5%]`}>
                        <Button
                            size="lg"
                            disabled={disabled}
                            error={dataError}
                            success={dataSuccess}
                            type='submit'
                        >Enviar</Button>
                    </div>

                </div>
            </FormStyle>
        </section>
    )
}