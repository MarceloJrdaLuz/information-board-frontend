import { yupResolver } from "@hookform/resolvers/yup"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"

import { createFieldServiceAtom } from "@/atoms/fieldServiceAtoms"
import { CreateFieldServicePayload } from "@/atoms/fieldServiceAtoms/types"
import DropdownObject from "@/Components/DropdownObjects"
import FormStyle from "@/Components/Forms/FormStyle"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { FieldServiceFormData, FieldServiceType, ILeader, WEEKDAY_LABEL } from "@/types/fieldService"
import { IPublisher } from "@/types/types"
import { useSetAtom } from "jotai"

interface FormValues {
  type: "FIXED" | "ROTATION"
  weekday: number
  time: string
  location: string
  leader_id?: string | null
}

export default function FormAddFieldServiceTemplate() {
  const { congregation } = useCongregationContext()
  const congregation_id = congregation?.id

  const [rotationMembers, setRotationMembers] = useState<IPublisher[]>([])
  const WEEKDAY_OPTIONS = Object.values(WEEKDAY_LABEL) // ["Domingo", "Segunda-feira", ..., "Sábado"]
  const [weekday, setWeekday] = useState<string>(WEEKDAY_OPTIONS[0])
  const [type, setType] = useState<"FIXED" | "ROTATION">("FIXED")
  const [leader, setLeader] = useState<ILeader | null>(null)
  const createFieldService = useSetAtom(createFieldServiceAtom)


  /* ======================
   * Buscar publishers
   ====================== */
  const { data } = useAuthorizedFetch<FieldServiceFormData>(
    congregation_id
      ? `/form-data?form=fieldService`
      : "",
    {
      allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
    }
  )

  const validation = yup.object({
    time: yup.string().required(),
    location: yup.string().required(),
    leader_id: yup.string().nullable(),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(validation)
  })


  /* ======================
   * Submit
   ====================== */
  async function onSubmit(values: FormValues) {
    if (!congregation_id) return

    const payload: CreateFieldServicePayload = {
      type,
      weekday: WEEKDAY_OPTIONS.indexOf(weekday),
      time: values.time,
      location: values.location,
      leader_id: type === "FIXED" ? leader?.id ?? null : null,
      rotation_members:
        type === "ROTATION"
          ? rotationMembers.map((m) => m.id)
          : [],
    }

    await toast.promise(
      createFieldService(congregation_id, payload),
      {
        pending: "Criando saída de campo..."
      }
    )
  }

  return (
    <FormStyle onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full h-fit flex-col justify-center items-center">

        <div className="my-6 m-auto w-11/12 font-semibold text-lg text-primary-200">
          Nova Saída de Campo
        </div>

        {/* Tipo */}
        <div className="my-2">
          <Dropdown
            title="Tipo de saída"
            selectedItem={FieldServiceType[type]}
            options={Object.values(FieldServiceType)}
            handleClick={(option) => setType(
              option === FieldServiceType.FIXED ? "FIXED" : "ROTATION"
            )}
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
        <Input type="time" placeholder="Horário da saída" registro={{
          ...register('time', { required: "Campo obrigatório" })
        }}
          invalid={errors?.time?.message ? 'invalido' : ''} />
        {errors?.time?.type && <InputError type={errors.time.type} field='time' />}

        {/* Local */}
        <Input type="text" placeholder="Local da saída" registro={{
          ...register('location', { required: "Campo obrigatório" })
        }}
          invalid={errors?.location?.message ? 'invalido' : ''} />
        {errors?.location?.type && <InputError type={errors.location.type} field='location' />}

        {/* Dirigente fixo */}
        <div className="my-2">
          {type === "FIXED" && (
            <DropdownObject<ILeader>
              title="Dirigente fixo"
              selectedItem={leader}
              items={data?.publishers ?? []}
              labelKey="fullName"
              handleChange={setLeader}
              full
              border
              textVisible
              searchable
              emptyMessage="Nenhum dirigente encontrado"
            />
          )}

          {/* Rodízio */}
          {type === "ROTATION" && (
            <DropdownMulti<IPublisher>
              title="Ordem do rodízio"
              items={data?.publishers ?? []}
              selectedItems={rotationMembers}
              handleChange={setRotationMembers}
              labelKey="fullName"
              full
              searchable
              border
              textVisible
              emptyMessage="Nenhum dirigente encontrado"
              showOrder
              orderHint="Defina a ordem do rodízio."
            />
          )}
        </div>

        <div className="flex justify-center items-center m-auto w-11/12 h-12 my-6">
          <Button type="submit">Criar Saída</Button>
        </div>
      </div>
    </FormStyle>
  )
}
