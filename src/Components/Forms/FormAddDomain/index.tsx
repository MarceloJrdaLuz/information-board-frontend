import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import { useCongregationContext } from "@/context/CongregationContext"
import { api } from "@/services/api"
import { ICongregation } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from 'yup'
import FormStyle from "../FormStyle"

export default function FormAddDomain() {

    const { addDomain } = useCongregationContext()
    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [optionsDrop, setOptionsDrop] = useState<string[]>()
    const [congregationSelect, setCongregationSelect] = useState('')
    const [congregationSelectNumber, setCongregationSelectNumber] = useState<string | undefined>('')

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const getCongregations = async () => {
        await api.get<ICongregation[]>('/congregations').then(res => {
            const { data } = res
            // setCongregations([...data])
            const optionsCongregations: ICongregation[] = []
            data.map(congregation => {
                optionsCongregations.push({ ...congregation })
            })
            setCongregations(optionsCongregations)

        }).catch(err => console.log(err))
    }

    useEffect(() => {
        setOptionsDrop(congregations?.map(congregation => `${congregation.name} (${congregation.number})`))
    }, [congregations])


    useEffect(() => {
        getCongregations()
    }, [])


    const esquemaValidacao = yup.object({
        userCode: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            userCode: ""
        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit(data: { userCode: string }) {
        toast.promise(addDomain(data.userCode, congregationSelectNumber ?? ""), {
            pending: "Adicionando usuário a congregação"
        })
        reset()
        setCongregationSelect('')
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    function handleClick(option: string) {
        setCongregationSelect(option)
        const congregationNumber = option.match(/\d+/g)?.toString()
        setCongregationSelectNumber(congregationNumber)
    }

    return (
        <section className="flex  justify-center items-center h-full">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Atribuir usuário ao domínio</div>
                    <Dropdown textVisible selectedItem={congregationSelect} handleClick={option => handleClick(option)} options={optionsDrop ?? []} title="Selecionar congregação" border />
                    <Input type="text" placeholder="Código do usuário" registro={{
                        ...register('userCode',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.userCode?.message ? 'invalido' : ''} />
                    {errors?.userCode?.type && <InputError type={errors.userCode.type} field='userCode' />}
                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button success={dataSuccess} error={dataError} disabled={(congregationSelect === '' || disabled)} type='submit'>Atribuir à domínio</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}