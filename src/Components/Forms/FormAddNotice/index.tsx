import FormStyle from "../FormStyle"
import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useState } from "react"
import { FormValues, IFormNoticeProps } from "./types"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import InputError from "@/Components/InputError"
import Input from "@/Components/Input"
import Calendar from "@/Components/Calendar"
import Button from "@/Components/Button"
import ModalHelp from "@/Components/ModalHelp"
import { HelpCircle } from "lucide-react"
import { useAtomValue } from "jotai"
import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import TextArea from "@/Components/TextArea"
import { useNotices } from "@/hooks/useNotices"

export default function FormAddNotice({ congregationNumber }: IFormNoticeProps) {

    const { createNotice, setExpiredNotice } = useNotices(congregationNumber)

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const [recurrentNotice, setRecurrentNotice] = useState(false)
    const [modalHelpShow, setModalHelpShow] = useState(false)

    const dataSuccess = useAtomValue(successFormSend)
    const dataError = useAtomValue(errorFormSend)
    const disabled = useAtomValue(buttonDisabled)

    const validationSchema = yup.object({
        title: yup.string().required(),
        text: yup.string().required(),
        startDay: yup.number(),
        endDay: yup.number()
    })


    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            title: "",
            text: "",
            startDay: undefined,
            endDay: undefined

        }, resolver: yupResolver(validationSchema)
    })

    function onSubmit({ title, text, startDay, endDay }: FormValues) {
        toast.promise(createNotice(title, text, startDay, endDay), {
            pending: "Criando novo anúncio"
        })
        reset()
        setRecurrentNotice(false)
        setSelectedDate(null)
    }

    function onError(error: any) {
        toast.error('Aconteceu algum erro! Confira todos os campos.')
    }

    const handleRecurrentNoticeChange = (isChecked: boolean) => {
        setRecurrentNotice(isChecked)
        // Limpe os valores e erros dos campos startDay e endDay quando o checkbox for desmarcado.
        if (!isChecked) {
            setValue('startDay', undefined)
            setValue('endDay', undefined)
            errors.startDay = undefined
            errors.endDay = undefined
        }
    }

    const handleDateChange = (date: Date) => {
        setExpiredNotice(date)
        setSelectedDate(date)
    }

    return (
        <section className="flex w-full justify-center items-center h-auto m-2">
            {modalHelpShow &&
                <ModalHelp
                    onClick={() => setModalHelpShow(false)}
                    title="Como criar um anúncio"
                    text={
                        `
    Ao criar o anúncio é necessário colocar um título, e uma descrição com o conteúdo do anúncio. Se você deseja que o anúncio apareça todos os meses em uma determinada época, abaixo vemos a opção "Anúncio recorrente". Selecionanda essa opção aparece dois campos para que você digite o dia inicial de cada mês que o anúncio deve aparecer, e também a data final. 
    Por exemplo: se você quer que todo mês do dia 01 até o dia 10 fique aparecendo um anúncio sobre o relatório, escolha a opção "Anúncio recorrente" e depois digite no "Dia inicial o número 1", e no "Dia final" o número 10. A opção abaixo "Data de expiração" você deve usar para diz o último dia que você quer que o anúncio apareça para os irmãos. Ele vai ficar disponível até à 23:59 do dia selecionado. 
    É importante também lembrar que se você não colocar uma data de expiração o anúncio vai ficar sempre sendo exibido. 
                        `} />}
            <FormStyle onSubmit={handleSubmit(onSubmit, onError)}>
                <div className={`w-full h-fit flex-col justify-center items-center`}>
                    <div className="flex justify-end ">
                        <HelpCircle onClick={() => setModalHelpShow(!modalHelpShow)} className="text-primary-200 cursor-pointer" />
                    </div>
                    <div className={`my-6  w-11/12 font-semibold text-2xl sm:text-2xl text-primary-200`}>Novo anúncio</div>

                    <Input type="text" placeholder="Título" registro={{
                        ...register('title',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.title?.message ? 'invalido' : ''} />
                    {errors?.title?.type && <InputError type={errors.title.type} field='title' />}

                    <TextArea placeholder="Conteúdo" registro={{
                        ...register('text',
                            { required: "Campo obrigatório" })
                    }}
                        invalid={errors?.text?.message ? 'invalido' : ''} />
                    {errors?.text?.type && <InputError type={errors.text.type} field='text' />}

                    <CheckboxBoolean
                        checked={recurrentNotice}
                        label="Anúncio recorrente"
                        handleCheckboxChange={(isChecked) => handleRecurrentNoticeChange(isChecked)}
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

                    <Calendar label="Data da expiração:" minDate={new Date()} selectedDate={selectedDate} handleDateChange={(date) => handleDateChange(date)} />

                    <div className={`flex justify-center items-center m-auto w-8/12 h-12 my-[10%]`}>
                        <Button success={dataSuccess} error={dataError} disabled={disabled} type='submit'>Criar Anúncio</Button>
                    </div>
                </div>
            </FormStyle>
        </section>
    )
}