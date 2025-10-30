import Button from "@/Components/Button"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import TextArea from "@/Components/TextArea"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from 'yup'
import FormStyle from "../FormStyle"
import { FormValues } from "./types"
import { useState } from "react"
import Dropdown from "@/Components/Dropdown"
import { createTermOfUseAtom } from "@/atoms/TermsOfUseAtoms"
import { CreateTermOfUsePayload } from "@/atoms/TermsOfUseAtoms/types"
import { useSetAtom } from "jotai"

export default function FormAddTermOfUse() {
    const [type, setType] = useState<"congregation" | "publisher">("publisher")
    const [optionDropdown, setOptionDropdown] = useState(["congregation", "publisher"])
    const createTermOfUse = useSetAtom(createTermOfUseAtom)

    const validationSchema = yup.object({
        title: yup.string().required(),
        version: yup.string().required(),
        content: yup.string().required(),
    })


    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            title: "",
            version: "",
            content: "",
        }, resolver: yupResolver(validationSchema)
    })

    function onSubmit({ title, content, version }: FormValues) {
        const payLoad: CreateTermOfUsePayload = {
            type,
            title,
            content,
            is_active: true,
            version
        }
        toast.promise(createTermOfUse(payLoad), {
            pending: "Criando novo termo de uso..."
        })
        reset()
        setType("publisher")
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }


    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Novo Termo de Uso</div>
                    <Dropdown selectedItem={type} textVisible border title="Tipo do termo" handleClick={(option) => setType(option as "congregation" | "publisher")} options={optionDropdown} />
                    <Input type="text" placeholder="Título" registro={{
                        ...register('title',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                    <Input type="number" placeholder="Versão do termo" registro={{
                        ...register('version',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.version?.message ? 'invalido' : ''} />
                    {errors?.version?.type && <InputError type={errors.version.type} field='version' />}

                    <TextArea placeholder="Conteúdo" registro={{
                        ...register('content',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.content?.message ? 'invalido' : ''} />
                    {errors?.content?.type && <InputError type={errors.content.type} field='content' />}


                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button type='submit'>Criar Termo</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}