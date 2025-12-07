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
import { useEffect, useState } from "react"
import Dropdown from "@/Components/Dropdown"
import { createTermOfUseAtom } from "@/atoms/TermsOfUseAtoms"
import { CreateTermOfUsePayload } from "@/atoms/TermsOfUseAtoms/types"
import { useSetAtom } from "jotai"
import { useFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"

export default function FormAddTermOfUse() {
    const [type, setType] = useState<"congregation" | "publisher">("publisher")
    const [optionDropdown, setOptionDropdown] = useState(["congregation", "publisher"])
    const [optionDropdownVersion, setOptionDropdownVersion] = useState<string[]>([])
    const [version, setVersion] = useState("")
    const createTermOfUse = useSetAtom(createTermOfUseAtom)

    const { data } = useFetch<ITermOfUse[]>('/terms')

    useEffect(() => {
        if (data) {
            // filtra apenas os termos do tipo selecionado
            const termsType = data.filter(term => term.type === type)

            // extrai as versões já usadas
            const existingVersions = termsType.map(term => term.version)

            // gera lista de 1.0 a 2.0 e remove as que já existem
            const filteredVersions = Array.from({ length: 11 }, (_, i) => (1 + i * 0.1).toFixed(1))
                .filter(v => !existingVersions.includes(v))

            setOptionDropdownVersion(filteredVersions)
        }
    }, [data, type])


    const validationSchema = yup.object({
        title: yup.string().required(),
        content: yup.string().required(),
    })


    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            title: "",
            content: "",
        }, resolver: yupResolver(validationSchema)
    })

    function onSubmit({ title, content }: FormValues) {
        const payLoad: CreateTermOfUsePayload = {
            type,
            title,
            content,
            is_active: true,
            version
        }
        toast.promise(createTermOfUse(payLoad), {
            pending: "Criando novo termo de uso..."
        }).then(() => {            
            reset()
            setType("publisher")
        }).catch(err => {
            console.log(err)
        })
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }


    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Novo Termo de Uso</div>
                    <div className="flex flex-col gap-2">
                        <Dropdown
                            selectedItem={type}
                            textVisible
                            textAlign="left"
                            border
                            title="Tipo do termo"
                            handleClick={(option) => setType(option as "congregation" | "publisher")}
                            options={optionDropdown}
                        />
                        <Dropdown
                            selectedItem={version}
                            textVisible
                            border
                            textAlign="left"
                            title="Versão"
                            handleClick={(option) => setVersion(option)}
                            options={optionDropdownVersion}
                        />
                    </div>
                    <Input type="text" placeholder="Título" registro={{
                        ...register('title',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}


                    <TextArea placeholder="Conteúdo" registro={{
                        ...register('content',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.content?.message ? 'invalido' : ''} />
                    {errors?.content?.type && <InputError type={errors.content.type} field='content' />}


                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button className="text-typography-200" type='submit'>Criar Termo</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}