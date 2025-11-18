import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { useFetch } from "@/hooks/useFetch"
import { usePublisher } from "@/hooks/usePublisher"
import { api } from "@/services/api"
import { ICheckPublisherConsent } from "@/types/consent"
import { IPayloadCreateReport } from "@/types/reports"
import { IPublisherList } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { ArrowLeftIcon } from "lucide-react"
import moment from "moment"
import 'moment/locale/pt-br'
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import CheckboxBoolean from "../../CheckboxBoolean"
import ConsentMessage from "../../ConsentMessage"
import DropdownSearch from "../../DropdownSearch"
import Input from "../../Input"
import InputError from "../../InputError"
import FormStyle from "../FormStyle"
import { FormValues } from "./types"

interface IRelatorioFormProps {
    congregationNumber: string
}

export default function FormReport(props: IRelatorioFormProps) {
    const { data } = useFetch<IPublisherList[]>(`/publishers/congregationNumber/${props.congregationNumber}`)
    const { createReport, createConsentRecord } = usePublisher()
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('')
    const [optionsDrop, setOptionsDrop] = useState<IPublisherList[]>([])
    const [publisherToSend, setPublisherToSend] = useState<IPublisherList>()
    const [underAnHour, setUnderAnHour] = useState(false)
    const [consentAcceptedShow, setConsentAcceptedShow] = useState(false)
    const [consentRecords, setConsentRecords] = useState<IPublisherList[]>()
    const [submittedData, setSubmittedData] = useState<FormValues>()
    const [deviceId, setDeviceId] = useState<string | undefined>()

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    useEffect(() => {
        if (data) {
            setOptionsDrop(data)
        }
    }, [data])

    useEffect(() => {
        const publisher = localStorage.getItem('publisher')

        if (publisher) {
            const parse: IPublisherList[] = JSON.parse(publisher)
            // Corrigir registros antigos sem id
            if (data) {
                const updated = parse.map(consentRecord => {
                    if (!consentRecord.id) {
                        const match = data.find(
                            pub =>
                                pub.fullName === consentRecord.fullName &&
                                pub.congregation_id === consentRecord.congregation_id
                        )
                        if (match) {
                            return { ...consentRecord, id: match.id }
                        }
                    }
                    return consentRecord
                })
                // Atualiza no state e no localStorage
                setConsentRecords(updated)
                localStorage.setItem('publisher', JSON.stringify(updated))

                if (updated[0]?.deviceId) {
                    setDeviceId(updated[0].deviceId)
                }
            } else {
                setConsentRecords(parse)
                setDeviceId(parse[0].deviceId)
            }
        }
    }, [data])


    useEffect(() => {
        const today = moment()
        const isFirstHalfOfMonth = today.date() >= 1 && today.date() <= 25

        const newDate = isFirstHalfOfMonth ? today.clone().subtract(1, 'month') : today
        setMonth(capitalizeFirstLetter(newDate.format('MMMM')))
        setYear(newDate.format('YYYY'))
    }, [])

    const handleClick = (option: IPublisherList | undefined) => {
        setPublisherToSend(option)
    }

    const validationSchema = yup.object({
        month: yup.string().required(),
        hours: yup.number(),
        studies: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        observations: yup.string()
    })

    const { register, handleSubmit, formState: { errors }, setValue, setError, clearErrors, resetField } = useForm({
        defaultValues: {
            month: '',
            hours: 0,
            studies: '',
            observations: ''
        },
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        setValue('month', month)
    }, [month, setValue])

    const handleConsentRecordsCreate = async () => {
        setConsentAcceptedShow(false)
        if (publisherToSend) {
            createConsentRecord(publisherToSend.id, deviceId)
        }

        if (submittedData) {
            sendSubmit(submittedData)
        }
    }

    function sendSubmit({ hours, month, observations, studies }: FormValues) {

        if (publisherToSend !== undefined) {
            if (hours !== null && hours <= 0 && !underAnHour) {
                setError('hours', {
                    type: 'min',
                })
            } else {
                const payload: IPayloadCreateReport = {
                    publisher_id: publisherToSend?.id ?? "",
                    hours: hours ?? 0,
                    month,
                    observations,
                    studies: Number(studies),
                    year
                }

                toast.promise(
                    createReport(payload),
                    {
                        pending: 'Autenticando...'
                    }
                )
            }
            resetField('hours')
            resetField('studies')
            resetField('observations')
        } else {
            toast.error('Publicador não selecionado!')
        }
    }

    async function onSubmit(data: FormValues) {
        setSubmittedData(data)

        const filterPublisherConsent = consentRecords?.filter(consentRecord =>
            consentRecord.id === publisherToSend?.id
        )

        if (filterPublisherConsent?.length) {
            const response = await api.get<ICheckPublisherConsent>(`/consent/check?publisher_id=${filterPublisherConsent[0].id}&type=publisher`)

            if (response.status === 200) {
                if (response.data.hasAccepted && response.data.isLatestVersion) {
                    sendSubmit(data)
                    return
                }
            } else {
                setConsentAcceptedShow(true)
            }
        }
        if (publisherToSend?.id) {
            setConsentAcceptedShow(true)
        }
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex justify-center ">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-auto flex-col justify-center items-center`}>
                    <div className="flex items-center mb-6">
                        <div className=" w-10 h-10">
                            <Link href={`/${props.congregationNumber}`} passHref>
                                <div className=" rounded-full bg-primary-200 p-2 hover:border hover:border-teste-100">
                                    <ArrowLeftIcon color="white" />
                                </div>
                            </Link>
                        </div>
                        <div className={`m-auto w-fit font-semibold text-2xl sm:text-3xl text-primary-200`}>Relatório</div>
                    </div>

                    <DropdownSearch full border title="Nome" handleClick={handleClick} options={optionsDrop} />

                    <Input
                        readOnly
                        type="text"
                        placeholder={month}
                        registro={{
                            ...register('month', { required: "Campo obrigatório" }),
                        }}
                    />

                    <CheckboxBoolean
                        checked={underAnHour}
                        label="Sou publicador, participei na pregação"
                        handleCheckboxChange={(isChecked) => {
                            setUnderAnHour(isChecked)
                            clearErrors('hours')
                        }}
                    />

                    <Input
                        type={underAnHour ? 'text' : 'number'}
                        placeholder="Horas"
                        registro={{
                            ...register('hours', {
                                required: 'Campo Obrigatório'
                            })
                        }}
                        invalid={errors?.hours ? 'invalido' : ''}
                        readOnly={underAnHour}
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

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 my-[5%]`}>
                        <Button
                            className="text-typography-200"
                            size="lg"
                            disabled={disabled}
                            error={dataError}
                            success={dataSuccess}
                            type='submit'
                        >Enviar</Button>
                    </div>
                    <Link className="text-primary-200 hover:underline font-semibold" href={"/meus-relatorios"}>
                        Meus Relatórios
                    </Link>
                </div>
            </FormStyle>
            {consentAcceptedShow &&
                <ConsentMessage
                    text="Essa é a primeira vez que você manda seu relatório
                    nesse dispositivo, é necessário aceitar o termo de consentimento!"
                    name={publisherToSend?.fullName}
                    onAccepted={handleConsentRecordsCreate}
                    onDecline={() => setConsentAcceptedShow(false)}
                    congregatioNumber={props.congregationNumber}
                />
            }
        </section>
    )
}