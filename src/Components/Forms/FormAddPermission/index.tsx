import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"
import Button from "@/Components/Button"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import { usePermissionsAndRoles } from "@/hooks/usePermissionsAndRoles"
import { FormPermission } from "@/types/permissionsAndRoles"
import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from 'yup'
import FormStyle from "../FormStyle"

export default function FormAddPermission() {
    const { createPermission } = usePermissionsAndRoles()
    const resetFormValue = useAtomValue(resetForm)
    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const esquemaValidacao = yup.object({
        name: yup.string().required(),
        description: yup.string().required()
    })

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: "",
            description: ""
        }, resolver: yupResolver(esquemaValidacao)
    })

    useEffect(() => {
        if (resetFormValue) reset()
    }, [resetFormValue, reset])

    function onSubmit(data: FormPermission) {
        toast.promise(createPermission(data.name, data.description), {
            pending: "Criando nova permissão"
        })
    }


    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }


    return (
        <section className="flex w-full justify-center items-center h-full m-2">
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Criar Permissão</div>

                    <Input type="text" placeholder="Nome da permissão" registro={{
                        ...register('name',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.name?.message ? 'invalido' : ''} />
                    {errors?.name?.type && <InputError type={errors.name.type} field='name' />}

                    <Input type="text" placeholder="Descrição da permissão" registro={{
                        ...register('description',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.description?.message ? 'invalido' : ''} />
                    {errors?.description?.type && <InputError type={errors.description.type} field='description' />}
                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button className="text-typography-200" success={dataSuccess} error={dataError} disabled={disabled} type='submit' >Criar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}