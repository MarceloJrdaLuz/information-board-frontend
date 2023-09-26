import FormStyle from "../FormStyle"
import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"
import { useContext} from "react"
import { FormPermission, PermissionAndRolesContext } from "@/context/PermissionAndRolesContext"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import Button from "@/Components/Button"

export default function FormAddPermission() {

    const { createPermission } = useContext(PermissionAndRolesContext)
    
    
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

    function onSubmit(data: FormPermission) {
        toast.promise(createPermission(data.name, data.description), {
            pending: "Criando nova permissão"
        })  
        reset()
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
                        <Button type='submit' >Criar Permissão</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}