import { yupResolver } from "@hookform/resolvers/yup"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"
import DropdownObject from "@/Components/DropdownObjects"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import FormStyle from "@/Components/Forms/FormStyle"

import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { updateFieldServiceAtom } from "@/atoms/fieldServiceAtoms"
import { UpdateFieldServicePayload } from "@/atoms/fieldServiceAtoms/types"
import { FieldServiceFormData, FieldServiceType, ILeader, IRotationMember, ITemplateFieldService, WEEKDAY_LABEL } from "@/types/fieldService"
import { IPublisher } from "@/types/types"
import { useSetAtom } from "jotai"
import { te } from "date-fns/locale"
import { I } from "framer-motion/dist/types.d-DagZKalS"

interface FormValues {
  type: "FIXED" | "ROTATION"
  weekday: number
  time: string
  location: string
  leader_id?: string | null
}

interface FormEditProps {
  template_id: string
}

export default function FormEditFieldServiceTemplate({ template_id }: FormEditProps) {
  const { congregation } = useCongregationContext()
  const congregation_id = congregation?.id

  const [rotationMembers, setRotationMembers] = useState<IPublisher[]>([])
  const [weekday, setWeekday] = useState<string>(Object.values(WEEKDAY_LABEL)[0])
  const [type, setType] = useState<"FIXED" | "ROTATION">("FIXED")
  const [leader, setLeader] = useState<ILeader | null>(null)

  const updateFieldService = useSetAtom(updateFieldServiceAtom)

  const WEEKDAY_OPTIONS = Object.values(WEEKDAY_LABEL)

  /* ======================
   * Fetch do template existente
   ====================== */
  const { data: formData } = useAuthorizedFetch<FieldServiceFormData>(
    congregation_id ? `/form-data?form=fieldService` : "",
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )

  const { data: template } = useAuthorizedFetch<ITemplateFieldService>(
    template_id ? `/field-service/templates/${template_id}` : "",
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )

  const validation = yup.object({
    time: yup.string().required(),
    location: yup.string().required(),
    leader_id: yup.string().nullable(),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: yupResolver(validation)
  })

  // quando o template carregar, atualiza os valores do form
  useEffect(() => {
    if (template && formData) {
      setType(template.type)
      setWeekday(WEEKDAY_OPTIONS[template.weekday])
      setLeader(template.leader)

      // Map rotation_members para IPublisher do formData.publishers
      const members: IPublisher[] = (template.rotation_members ?? [])
        .map(rm => formData.publishers.find(p => p.id === rm.publisher.id))
        .filter(Boolean) as IPublisher[] // remove undefined
      setRotationMembers(members)

      reset({
        time: template.time,
        location: template.location,
        leader_id: template.leader?.id ?? null,
      })
    }
  }, [template, formData, reset])

  /* ======================
   * Submit
   ====================== */
  async function onSubmit(values: FormValues) {
    if (!congregation_id) return

    const payload: UpdateFieldServicePayload = {
      type,
      weekday: WEEKDAY_OPTIONS.indexOf(weekday),
      time: values.time,
      location: values.location,
      leader_id: type === "FIXED" ? leader?.id ?? null : null,
      rotation_members: type === "ROTATION"
        ? rotationMembers.map(p => p.id) // pega só o ID do publisher
        : [],
    }

    console.log(payload)

    await toast.promise(
      updateFieldService(template_id, payload),
      { pending: "Atualizando saída de campo..." }
    )
  }

  return (
    <FormStyle onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full h-fit flex-col justify-center items-center">

        <div className="my-6 m-auto w-11/12 font-semibold text-lg text-primary-200">
          Editar Saída de Campo
        </div>

        {/* Tipo */}
        <div className="my-2">
          <Dropdown
            title="Tipo de saída"
            selectedItem={type}
            options={Object.values(FieldServiceType)}
            handleClick={(option) => setType(option === FieldServiceType.FIXED ? "FIXED" : "ROTATION")}
            full
            border
            textVisible
          />
        </div>

        {/* Dia da semana */}
        <div className="my-2">
          <Dropdown
            title="Dia da semana"
            options={WEEKDAY_OPTIONS}
            selectedItem={weekday}
            handleClick={setWeekday}
            full
            border
            textVisible
          />
        </div>

        {/* Horário */}
        <Input
          type="time"
          placeholder="Horário da saída"
          registro={{ ...register('time', { required: "Campo obrigatório" }) }}
          invalid={errors?.time?.message ? 'invalido' : ''}
        />
        {errors?.time?.type && <InputError type={errors.time.type} field='time' />}

        {/* Local */}
        <Input
          type="text"
          placeholder="Local da saída"
          registro={{ ...register('location', { required: "Campo obrigatório" }) }}
          invalid={errors?.location?.message ? 'invalido' : ''}
        />
        {errors?.location?.type && <InputError type={errors.location.type} field='location' />}

        {/* Dirigente fixo / Rodízio */}
        <div className="my-2">
          {type === "FIXED" && (
            <DropdownObject<ILeader>
              title="Dirigente fixo"
              selectedItem={leader}
              items={formData?.publishers ?? []}
              labelKey="fullName"
              handleChange={setLeader}
              full
              border
              textVisible
              searchable
              emptyMessage="Nenhum dirigente encontrado"
            />
          )}
          {type === "ROTATION" && (
            <DropdownMulti<IPublisher>
              title="Ordem do rodízio"
              items={formData?.publishers ?? []}
              selectedItems={rotationMembers}
              handleChange={setRotationMembers}
              labelKey="fullName" // aqui acessa o fullName do publisher dentro do IRotationMember
              full
              searchable
              border
              showOrder
              orderHint="Defina a ordem do rodízio."
              textVisible
              emptyMessage="Nenhum dirigente encontrado"
            />

          )}
        </div>

        <div className="flex justify-center items-center m-auto w-11/12 h-12 my-6">
          <Button type="submit">Atualizar Saída</Button>
        </div>

      </div>
    </FormStyle>
  )
}
