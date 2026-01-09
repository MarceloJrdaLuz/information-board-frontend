import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import Button from "@/Components/Button"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"
import DropdownObject from "@/Components/DropdownObjects"
import FormStyle from "@/Components/Forms/FormStyle"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"

import { updateFieldServiceAtom, updateFieldServiceLocationRotationAtom } from "@/atoms/fieldServiceAtoms"
import { UpdateFieldServiceLocationOverridePayload, UpdateFieldServicePayload } from "@/atoms/fieldServiceAtoms/types"
import Calendar from "@/Components/Calendar"
import CheckboxBoolean from "@/Components/CheckboxBoolean"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { FieldServiceFormData, FieldServiceType, ILeader, ITemplateFieldService, WEEKDAY_LABEL } from "@/types/fieldService"
import { IPublisher } from "@/types/types"
import { useSetAtom } from "jotai"
import { PlusCircle, Trash } from "lucide-react"
import { ConfirmDeleteModal } from "@/Components/ConfirmDeleteModal"

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

type LocationOverrideForm = {
  date: string | null
  location: string
}

export default function FormEditFieldServiceTemplate({ template_id }: FormEditProps) {
  const { congregation } = useCongregationContext()
  const congregation_id = congregation?.id

  const [rotationMembers, setRotationMembers] = useState<IPublisher[]>([])
  const [weekday, setWeekday] = useState<string>(Object.values(WEEKDAY_LABEL)[0])
  const [type, setType] = useState<"FIXED" | "ROTATION">("FIXED")
  const [leader, setLeader] = useState<ILeader | null>(null)
  const [locationRotation, setLocationRotation] = useState(false)
  const [locationOverrides, setLocationOverrides] = useState<LocationOverrideForm[]>([])

  const updateFieldService = useSetAtom(updateFieldServiceAtom)
  const updateFieldServiceLocationOverride = useSetAtom(updateFieldServiceLocationRotationAtom)

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
      setLocationRotation(template.location_rotation ?? false)
      setLocationOverrides(
        template.location_overrides?.map(o => ({
          date: o.date,
          location: o.location,
        })) ?? []
      )

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

    await toast.promise(
      updateFieldService(template_id, payload),
      { pending: "Atualizando saída de campo..." }
    )
  }

  async function handleSaveLocationOverride() {
    if (!congregation_id) return

    const weeks = locationOverrides
      .filter(o => o.date && o.location.trim() !== "")
      .map(o => ({
        date: o.date as string, // seguro após o filter
        location: o.location.trim(),
      }))

    if (weeks.length === 0) {
      toast.warning("Adicione ao menos um local válido por semana.")
      return
    }

    const payload: UpdateFieldServiceLocationOverridePayload = {
      weeks,
    }

    await toast.promise(
      updateFieldServiceLocationOverride(template_id, payload),
      {
        pending: "Salvando locais das semanas...",
      }
    ).then().catch(err => console.log(err))
  }

  async function handleClearAllLocations() {
    await toast.promise(
      updateFieldServiceLocationOverride(template_id, {
        weeks: [],
        clear_all: true,
      }),
      { pending: "Removendo todos os locais..." }
    ).then(() => {
      setLocationOverrides([])
      setLocationRotation(false)
    }).catch(err => console.log(err))
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
          {/* Local */}
          <Input
            type="text"
            placeholder="Local"
            registro={{ ...register('location', { required: "Campo obrigatório" }) }}
            invalid={errors?.location?.message ? 'invalido' : ''}
          />
          {type === "FIXED" && (
            <div className="my-3 flex items-center gap-2">
              <CheckboxBoolean label="Local variável por semana" checked={locationRotation} handleCheckboxChange={(e) => setLocationRotation(e)} />
            </div>
          )}
        </div>

        {type === "FIXED" && locationRotation && (
          <div className="mt-4 border rounded-lg p-4 bg-surface-100">
            <h3 className="font-semibold text-sm text-primary-200 mb-3">
              Locais por semana
            </h3>

            <div className="flex flex-col items-center gap-3">
              {locationOverrides && locationOverrides.length > 0 &&
                <div className="w-full flex justify-end">
                  <ConfirmDeleteModal
                    title="Limpar todos os locais"
                    message="Isso removerá todos os locais programados desta saída. Deseja continuar?"
                    onDelete={handleClearAllLocations}
                    button={
                      <Button type="button" size="sm" outline className="text-red-500 w-fit">
                        <Trash className="mr-1 w-4" /> Limpar todos
                      </Button>
                    }
                  />
                </div>}
              {locationOverrides.map((item, index) => (
                <div key={index} className="w-full border border-typography-200 rounded-xl p-3 bg-surface-100
               flex justify-center flex-wrap gap-2">
                  {/* Data */}
                  <div className="w-full h-full max-w-[300px]">
                    <div className="w-full">
                      <Calendar
                        label="Dia"
                        titleHidden
                        selectedDate={item.date}
                        handleDateChange={(date) => {
                          const copy = [...locationOverrides]
                          copy[index].date = date
                          setLocationOverrides(copy)
                        }}
                        allowedWeekday={WEEKDAY_OPTIONS.indexOf(weekday)}
                        disabled={false}
                        full
                      />
                    </div>

                    {/* Local */}
                    <Input
                      type="text"
                      placeholder="Local da semana"
                      value={item.location}
                      onChange={(e) => {
                        const copy = [...locationOverrides]
                        copy[index].location = e.target.value
                        setLocationOverrides(copy)
                      }}
                    />

                    <div className="w-full flex justify-end">
                      <Button onClick={() =>
                        setLocationOverrides(prev =>
                          prev.filter((_, i) => i !== index)
                        )
                      } size="sm" outline className="text-red-500 w-fit ">
                        <Trash className="mr-1 w-4" /> Excluir
                      </Button>
                    </div>
                  </div>

                </div>
              ))}
              <div className="w-full flex justify-end">
                <PlusCircle className="cursor-pointer text-primary-200 hover:text-primary-200/80 w-5 h-5 items-end" onClick={() =>
                  setLocationOverrides(prev => [
                    ...prev,
                    { date: null, location: "" }
                  ])
                } />
              </div>
            </div>
            {locationOverrides && locationOverrides.length > 0 && <div className="flex justify-center items-center m-auto w-11/12 h-12 my-6 gap-2">
              <Button onClick={handleSaveLocationOverride} outline type="button">Salvar locais</Button>
            </div>}
          </div>
        )}

        <div className="flex justify-center items-center m-auto w-11/12 h-12 my-6">
          <Button type="submit">Atualizar Saída</Button>
        </div>

      </div>
    </FormStyle>
  )
}
