import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import Input from "../Input"
import FormStyle from "../FormStyle"
import InputError from "../InputError"
import { FormValues } from "./types"
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from 'react-hook-form'
import { meses } from "@/functions/meses"
import Button from "../Button"
import { useFetch } from "@/hooks/useFetch"
import { IPublisherList } from "@/entities/types"
import DropdownSearch from "../DropdownSearch"
import { PublisherContext } from "@/context/PublisherContext"
import CheckboxBoolean from "../CheckboxBoolean"
import { ArrowLeftIcon } from "lucide-react"
import { api } from "@/services/api"
import ConsentMessage from "../ConsentMessage"

interface IRelatorioFormProps {
    congregationNumber: string
}

export default function RelatorioForm(props: IRelatorioFormProps) {
    const { data } = useFetch<IPublisherList[]>(`/publishers/congregationNumber/${props.congregationNumber}`)
    const { createReport, createConsentRecord } = useContext(PublisherContext)

    const [month, setMonth] = useState('')
    const [year, setYear] = useState('')
    const [optionsDrop, setOptionsDrop] = useState<IPublisherList[]>([])
    const [publisherToSend, setPublisherToSend] = useState<IPublisherList>()
    const [underAnHour, setUnderAnHour] = useState(false)
    const [consentAcceptedShow, setConsentAcceptedShow] = useState(false)
    const [consentRecords, setConsentRecords] = useState<IPublisherList[]>()
    const [submittedData, setSubmittedData] = useState<FormValues>()
    const [deviceId, setDeviceId] = useState<string | undefined>()

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
        setMonth(meses[new Date().getMonth()])
        setYear(new Date().getFullYear().toString())
    }, [])

    const handleClick = (option: IPublisherList) => {
        setPublisherToSend(option)
    }

    const esquemaValidacao = yup.object({
        month: yup.string().required(),
        publications: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        videos: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        hours: yup.number(),
        revisits: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        studies: yup.number().transform((value) => (isNaN(value) ? 0 : value)).nullable(),
        observations: yup.string()
    })

    const { register, handleSubmit, formState: { errors }, setValue, setError, clearErrors, resetField } = useForm({
        defaultValues: {
            month: '',
            publications: '',
            videos: '',
            hours: 0,
            revisits: '',
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
                congregation_id: publisherToSend.congregation_id
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
                            congregation_id: publisherToSend.congregation_id
                        },
                        Number(data.publications),
                        Number(data.videos),
                        data.hours ?? 0,
                        Number(data.revisits),
                        Number(data.studies),
                        underAnHour ? 'Fez atividades' : data.observations
                    ),
                    {
                        pending: 'Autenticando...'
                    }
                )
            }
            resetField('publications')
            resetField('videos')
            resetField('hours')
            resetField('revisits')
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

                    <Input
                        type="number"
                        placeholder="Publicações"
                        registro={{
                            ...register('publications')
                        }}
                        invalid={errors?.publications?.message ? 'invalido' : ''}
                    />
                    {errors?.publications?.type && <InputError type={errors.publications?.type} field='publications' />}

                    <Input
                        type="number"
                        placeholder="Vídeos"
                        registro={{
                            ...register('videos')
                        }}
                        invalid={errors?.videos?.message ? 'invalido' : ''}
                    />
                    {errors?.videos?.type && <InputError type={errors?.videos?.type} field='videos' />}

                    <CheckboxBoolean
                        checked={underAnHour}
                        label="Menos de uma hora"
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
                        placeholder="Revisitas"
                        registro={{
                            ...register('revisits')
                        }}
                        invalid={errors?.revisits?.message ? 'invalido' : ''}
                    />
                    {errors?.revisits?.type && <InputError type={errors?.revisits?.type} field='revisits' />}

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
                        registro={{
                            ...register('observations')
                        }}
                        invalid={errors?.observations?.message ? 'invalido' : ''}
                    />
                    {errors?.observations?.type && <InputError type={errors?.observations?.type} field='observations' />}

                    <div className={`flex justify-center items-center m-auto w-11/12 h-12 sm:my-[5%]`}>
                        <Button
                            color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black'
                            hoverColor='bg-button-hover'
                            title='Enviar'
                            type='submit'
                        />
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