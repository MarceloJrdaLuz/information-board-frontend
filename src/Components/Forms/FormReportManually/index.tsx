import { useEffect, useState } from "react"
import Input from "../../Input"
import FormStyle from "../FormStyle"
import InputError from "../../InputError"
import { FormValues } from "./types"
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import { IPublisher, IReports, Privileges, PrivilegesMinistry } from "@/entities/types"
import { usePublisherContext } from "@/context/PublisherContext"
import Button from "@/Components/Button"
import { useAtomValue } from "jotai"
import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import 'moment/locale/pt-br';
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { useRouter } from "next/router"
import CheckboxUnique from "@/Components/CheckBoxUnique"

interface IRelatorioFormProps {
    report: IReports | null
    publisher?: IPublisher | null
}

export default function FormReportManually({ report, publisher }: IRelatorioFormProps) {
    const { createReportManually } = usePublisherContext()
    const router = useRouter()
    const { month, congregationId } = router.query
    const monthParam = month as string

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const [privilege, setPrivilege] = useState<string>(Privileges.PUBLICADOR)
    const optionsCheckboxPrivilege = useState<string[]>(Object.values(PrivilegesMinistry))

    const esquemaValidacao = yup.object({
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
        resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        if(report?.privileges){
            setPrivilege(report?.privileges[0])
        }
        setValue('month', capitalizeFirstLetter(monthParam));
        setValue('hours', privilege !== "Publicador" ? report?.hours : 0);
        if (report?.studies) {
            setValue('studies', report?.studies.toString());
        }
        setValue('observations', report?.observations ?? "");
    }, [report, monthParam, setValue, privilege])

    const handleCheckboxPrivilege = (selectedItems: string) => {
        setPrivilege(selectedItems)
    }

    async function onSubmit(data: FormValues) {
        const splitMonth = data.month.split(' ')
        toast.promise(
            createReportManually(
                splitMonth[0],
                splitMonth[1],
                {
                    fullName: report?.publisher.fullName ?? publisher?.fullName ?? "",
                    nickName: report?.publisher.nickname ?? publisher?.nickname ?? "",
                    congregation_id: report?.publisher.congregation.id ?? publisher?.congregation.id ?? "",
                    privileges: [privilege]
                },
                data.hours ?? 0,
                Number(data.studies),
                data.observations
            ),
            {
                pending: 'Autenticando...'
            }
        )
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex justify-center ">
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
                        maxLength={26}
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