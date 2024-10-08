import Link from "next/link"
import { useEffect, useState } from "react"
import Input from "../../Input"
import FormStyle from "../FormStyle"
import InputError from "../../InputError"
import { FormValues } from "./types"
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import { useFetch } from "@/hooks/useFetch"
import { IPublisherList } from "@/entities/types"
import DropdownSearch from "../../DropdownSearch"
import { usePublisherContext } from "@/context/PublisherContext"
import CheckboxBoolean from "../../CheckboxBoolean"
import { ArrowLeftIcon } from "lucide-react"
import { api } from "@/services/api"
import ConsentMessage from "../../ConsentMessage"
import Button from "@/Components/Button"
import { useAtomValue } from "jotai"
import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import moment from "moment"
import 'moment/locale/pt-br'
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"

interface IRelatorioFormProps {
    congregationNumber: string
}

export default function FormReport(props: IRelatorioFormProps) {
    const { data } = useFetch<IPublisherList[]>(`/publishers/congregationNumber/${props.congregationNumber}`)
    const { createReport, createConsentRecord } = usePublisherContext()
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
            setConsentRecords(parse)
            setDeviceId(parse[0].deviceId)
        }
    }, [])

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

    const esquemaValidacao = yup.object({
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
        resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        setValue('month', month)
    }, [month, setValue])

    const handleConsentRecordsCreate = async () => {
        setConsentAcceptedShow(false)
        if (publisherToSend) {
            const publisherConsent = {
                fullName: publisherToSend.fullName,
                nickname: publisherToSend.nickname,
                congregation_id: publisherToSend.congregation_id,
                congregation_number: publisherToSend.congregation_number
            }
            createConsentRecord(publisherConsent, deviceId)
        }

        if (submittedData) {
            sendSubmit(submittedData)
        }
    }

    function sendSubmit(data: FormValues) {
        if (publisherToSend !== undefined) {
            if (data.hours !== null && data.hours <= 0 && !underAnHour) {
                setError('hours', {
                    type: 'min',
                })
            } else {
                toast.promise(
                    createReport(
                        data.month,
                        year,
                        {
                            fullName: publisherToSend.fullName,
                            nickName: publisherToSend.nickname || '',
                            congregation_id: publisherToSend.congregation_id,
                            congregation_number: publisherToSend.congregation_number
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
            consentRecord.fullName === publisherToSend?.fullName &&
            consentRecord.congregation_id === publisherToSend?.congregation_id &&
            consentRecord.nickname === publisherToSend?.nickname
        )

        if (filterPublisherConsent?.length) {
            const response = await api.post('/checkConsentRecords', {
                fullName: filterPublisherConsent[0].fullName,
                nickname: filterPublisherConsent[0].nickname,
                deviceId: filterPublisherConsent[0].deviceId,
                consentDate: filterPublisherConsent[0].consentDate,
            })

            if (response.status === 200) {
                sendSubmit(data)
                return
            } else {
                setConsentAcceptedShow(true)
            }
        }
        if (publisherToSend?.fullName) {

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