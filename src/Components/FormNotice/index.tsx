import FormStyle from "../FormStyle"
import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"
import { useContext, useEffect, useState } from "react"
import Input from "../Input"
import InputError from "../InputError"
import Button from "../Button"
import { NoticeContext } from "@/context/NoticeContext"
import { FormValues, IFormNoticeProps } from "./types"
import Calendar from "../Calendar"
import CheckboxBoolean from "../CheckboxBoolean"

export default function FormNotice({ congregationNumber }: IFormNoticeProps) {

    const { createNotice, setCongregationNumber } = useContext(NoticeContext)
    const [recurrentNotice, setRecurrentNotice] = useState(false)

    useEffect(() => {
        setCongregationNumber(congregationNumber)
    }, [setCongregationNumber, congregationNumber])

    const esquemaValidacao = yup.object({
        title: yup.string().required(),
        text: yup.string().required(),
        startDay: yup.number(),
        endDay: yup.number()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            title: "",
            text: "",
            startDay: undefined,
            endDay: undefined

        }, resolver: yupResolver(esquemaValidacao)
    })

    function onSubmit({ title, text, startDay, endDay }: FormValues) {
        toast.promise(createNotice(title, text, startDay, endDay), {
            pending: "Criando novo anúncio"
        })
        reset()
        setRecurrentNotice(false)
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Novo anúncio</div>

                    <Input type="text" placeholder="Título" registro={{
                        ...register('title',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                    <Input type="text" placeholder="Texto" registro={{
                        ...register('text',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.text?.message ? 'invalido' : ''} />
                    {errors?.text?.type && <InputError type={errors.text.type} field='text' />}

                    <CheckboxBoolean
                        checked={recurrentNotice}
                        label="Anúncio recorrente"
                        handleCheckboxChange={(isChecked) => {
                            setRecurrentNotice(!recurrentNotice)
                        }}
                    />

                    {recurrentNotice && (
                        <>
                            <Input type="number" placeholder="Dia inicial" registro={{
                                ...register('startDay',
                                    { required: "Campo obrigatório" })
                            }}
                                invalid={errors?.startDay?.message ? 'invalido' : ''} />
                            {errors?.startDay?.type && <InputError type={errors.startDay.type} field='startDay' />}

                            <Input type="number" placeholder="Dia final" registro={{
                                ...register('endDay',
                                    { required: "Campo obrigatório" })
                            }}
                                invalid={errors?.endDay?.message ? 'invalido' : ''} />
                            {errors?.endDay?.type && <InputError type={errors.endDay.type} field='endDay' />}
                        </>
                    )}

                    <Calendar />

                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button color='bg-primary-200 hover:opacity-90 text-secondary-100 hover:text-black' hoverColor='bg-button-hover' title='Criar anúncio' type='submit' />
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}