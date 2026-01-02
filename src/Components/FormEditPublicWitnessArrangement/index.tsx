import { yupResolver } from "@hookform/resolvers/yup"
import { useSetAtom, useAtomValue } from "jotai"
import { useForm, useFieldArray } from "react-hook-form"
import { useEffect, useState } from "react"
import * as yup from "yup"
import { toast } from "react-toastify"

import Button from "@/Components/Button"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"

import { useFetch } from "@/hooks/useFetch"
import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import { updatePublicWitnessArrangementAtom } from "@/atoms/publicWitnessAtoms.ts"
import { UpdatePublicWitnessArrangementPayload } from "@/atoms/publicWitnessAtoms.ts/types"
import FormStyle from "../Forms/FormStyle"

import {
  IPublicWitnessArrangement,
  IPublicWitnessPublisher
} from "@/types/publicWitness"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import CheckboxBoolean from "../CheckboxBoolean"


interface Props {
  arrangement_id: string
}

interface FormValues {
  title: string
  date?: string
  timeSlots: {
    id?: string
    start_time: string
    end_time: string
    is_rotative: boolean
  }[]
}

const validation = yup.object({
  title: yup.string().required("Campo obrigatório"),
  timeSlots: yup.array().min(1, "Adicione ao menos um horário")
})

export default function FormEditPublicWitnessArrangement({ arrangement_id }: Props) {
  const updateArrangement = useSetAtom(updatePublicWitnessArrangementAtom)

  const disabled = useAtomValue(buttonDisabled)
  const dataError = useAtomValue(errorFormSend)
  const dataSuccess = useAtomValue(successFormSend)

  const { data: arrangement } = useFetch<IPublicWitnessArrangement>(
    `/public-witness/arrangements/${arrangement_id}`
  )

  const { data: publishers } = useFetch<IPublicWitnessPublisher[]>(
    `/form-data?form=publicWitness`
  )

  /** 🔹 Estados de regra de negócio */
  const [isFixed, setIsFixed] = useState(true)

  const [weekday, setWeekday] = useState<Weekday | null>(null)

  /** 🔹 Publicadores por slot */
  const [slotPublishers, setSlotPublishers] =
    useState<IPublicWitnessPublisher[][]>([])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: yupResolver(validation)
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "timeSlots"
  })

  /** 🔁 BACKEND → FORM */
  useEffect(() => {
    if (!arrangement || !publishers) return

    setIsFixed(arrangement.is_fixed)
    setWeekday(arrangement.weekday)

    reset({
      title: arrangement.title,
      date: arrangement.date ?? "",
      timeSlots: arrangement.timeSlots.map(slot => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_rotative: slot.is_rotative
      }))
    })

    setSlotPublishers(
      arrangement.timeSlots.map(slot =>
        slot.defaultPublishers
          .map(dp => publishers.find(p => p.id === dp.publisher_id))
          .filter(Boolean) as IPublicWitnessPublisher[]
      )
    )
  }, [arrangement, publishers, reset])

  /** 🚀 FORM → BACKEND */
  async function onSubmit(form: FormValues) {
    const payload: UpdatePublicWitnessArrangementPayload = {
      title: form.title,
      is_fixed: isFixed,
      weekday: isFixed ? weekday : null,
      date: !isFixed ? form.date ?? null : null,
      timeSlots: form.timeSlots.map((slot, index) => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        order: index + 1,
        is_rotative: slot.is_rotative,
        defaultPublishers: (slotPublishers[index] ?? []).map((p, i) => ({
          publisher_id: p.id,
          order: i
        }))
      }))
    }

    await toast.promise(
      updateArrangement(arrangement_id, payload),
      { pending: "Atualizando arranjo..." }
    )
  }

  return (
    <FormStyle onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full flex flex-col gap-4">

        <Input
          placeholder="Título do arranjo"
          registro={{ ...register("title") }}
          invalid={errors.title ? "invalido" : ""}
        />
        {errors.title && <InputError type={errors.title.type} field="title" />}

        {/* 🔹 Tipo de arranjo */}
        <Dropdown
          title="Tipo de arranjo"
          options={["Fixo", "Data específica"]}
          selectedItem={isFixed ? "Fixo" : "Data específica"}
          handleClick={opt => setIsFixed(opt === "Fixo")}
          full
          border
          textVisible
        />

        {isFixed ? (
          <Dropdown
            title="Dia da semana"
            options={Object.entries(WEEKDAY_LABEL).map(
              ([k, v]) => `${k} - ${v}`
            )}
            selectedItem={
              weekday !== null
                ? `${weekday} - ${WEEKDAY_LABEL[weekday]}`
                : undefined
            }
            handleClick={opt => setWeekday(Number(opt.split(" - ")[0]))}
            full
            border
            textVisible
          />
        ) : (
          <Input type="date" registro={{ ...register("date") }} />
        )}

        {/* 🔹 Slots */}
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap items-center">
              <Input
                placeholder="Início"
                type="time"
                registro={{ ...register(`timeSlots.${index}.start_time`) }}
              />
              <Input
                placeholder="Fim"
                type="time"
                registro={{ ...register(`timeSlots.${index}.end_time`) }}
              />

            </div>
            <CheckboxBoolean
              checked={watch(`timeSlots.${index}.is_rotative`) ?? false}
              handleCheckboxChange={(checked) =>
                setValue(`timeSlots.${index}.is_rotative`, checked, { shouldDirty: true })
              }
              label="Rodízio?"
            />

            {!watch(`timeSlots.${index}.is_rotative`) && (
              <DropdownMulti<IPublicWitnessPublisher>
                title="Publicadores fixos"
                items={publishers ?? []}
                selectedItems={slotPublishers[index] ?? []}
                handleChange={items => {
                  setSlotPublishers(prev => {
                    const copy = [...prev]
                    copy[index] = items
                    return copy
                  })
                }}
                labelKey="fullName"
                searchable
                full
                border
                textVisible
              />
            )}

            <Button
              outline
              type="button"
              className="text-red-500"
              onClick={() => {
                remove(index)
                setSlotPublishers(prev => prev.filter((_, i) => i !== index))
              }}
            >
              Remover horário
            </Button>

          </div>
        ))}

        <Button
          type="button"
          outline
          onClick={() => {
            append({ start_time: "", end_time: "", is_rotative: false })
            setSlotPublishers(prev => [...prev, []])
          }}
        >
          + Adicionar horário
        </Button>

        <Button
          type="submit"
          disabled={disabled}
          error={dataError}
          success={dataSuccess}
        >
          Salvar alterações
        </Button>
      </div>
    </FormStyle>
  )
}
