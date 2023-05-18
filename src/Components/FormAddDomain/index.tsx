import FormStyle from "../FormStyle";
import * as yup from 'yup'
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import Dropdown from "../Dropdown";
import { useContext, useEffect, useState } from "react";
import { api } from "@/services/api";
import Input from "../Input";
import InputError from "../InputError";
import { ICongregation } from "@/entities/types";
import Button from "../Button";
import { CongregationContext } from "@/context/CongregationContext";

export default function FormAddDomain() {

    const { addDomain } = useContext(CongregationContext)
    const [congregations, setCongregations] = useState<ICongregation[]>()
    const [optionsDrop, setOptionsDrop] = useState<string[]>()
    const [consgregationSelect, setCongregationSelect] = useState('')
    const [congregationSelectNumber, setCongregationSelectNumber] = useState<string | undefined>('')


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
        setOptionsDrop(congregations?.map(congregation => `${congregation.name} ${congregation.number}`))
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
                    <Dropdown handleClick={option => handleClick(option)} options={optionsDrop ?? []} title="Congregação" border/>
                    <span className="ml-5">{consgregationSelect}</span>
                    <Input type="text" placeholder="Código do usuário" registro={{
                        ...register('userCode',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.userCode?.message ? 'invalido' : ''} />
                    {errors?.userCode?.type && <InputError type={errors.userCode.type} field='userCode' />}
                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Atribuir à domínio' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}