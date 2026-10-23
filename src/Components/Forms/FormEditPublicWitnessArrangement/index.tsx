import { yupResolver } from "@hookform/resolvers/yup"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "react-toastify"
import * as yup from "yup"

import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import Dropdown from "@/Components/Dropdown"
import DropdownMulti from "@/Components/DropdownMulti"
import Input from "@/Components/Input"
import InputError from "@/Components/InputError"

import { buttonDisabled, errorFormSend, successFormSend } from "@/atoms/atom"
import { updatePublicWitnessArrangementAtom } from "@/atoms/publicWitnessAtoms.ts"
import { UpdatePublicWitnessArrangementPayload } from "@/atoms/publicWitnessAtoms.ts/types"
import { useFetch } from "@/hooks/useFetch"
import FormStyle from "../FormStyle"

import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import {
    IPublicWitnessArrangement,
    IPublicWitnessPublisher
} from "@/types/publicWitness"
import dayjs from "dayjs"
import { Clock, Plus, RefreshCw, Trash2 } from "lucide-react"
import CheckboxBoolean from "../../CheckboxBoolean"


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

  /** 🔹 Preferências por slot */
  const [slotPreferences, setSlotPreferences] =
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

    const sortedInitialSlots = (arrangement.timeSlots ?? [])
      .slice()
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

    setIsFixed(arrangement.is_fixed)
    setWeekday(arrangement.weekday)

    reset({
      title: arrangement.title,
      date: arrangement.date ?? "",
      timeSlots: sortedInitialSlots.map(slot => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_rotative: slot.is_rotative
      }))
    })

    setSlotPublishers(
      sortedInitialSlots.map(slot =>
        (slot.defaultPublishers ?? [])
          .map(dp => publishers.find(p => p.id === dp.publisher_id))
          .filter(Boolean) as IPublicWitnessPublisher[]
      )
    )

    setSlotPreferences(
      sortedInitialSlots.map(slot =>
        (slot.preferences ?? [])
          .map(pref => publishers.find(p => p.id === pref.publisher_id))
          .filter(Boolean) as IPublicWitnessPublisher[]
      )
    )
  }, [arrangement, publishers, reset])

  /** 🚀 FORM → BACKEND */
  async function onSubmit(form: FormValues) {
    const indexedSlots = form.timeSlots.map((slot, index) => ({
      slot,
      publishers: slotPublishers[index] ?? [],
      preferences: slotPreferences[index] ?? []
    }))

    indexedSlots.sort((a, b) => a.slot.start_time.localeCompare(b.slot.start_time))

    const payload: UpdatePublicWitnessArrangementPayload = {
      title: form.title,
      is_fixed: isFixed,
      weekday: isFixed ? weekday : null,
      date: !isFixed ? form.date ?? null : null,
      timeSlots: indexedSlots.map((item, index) => ({
        id: item.slot.id,
        start_time: item.slot.start_time,
        end_time: item.slot.end_time,
        order: index + 1,
        is_rotative: item.slot.is_rotative,
        defaultPublishers: item.publishers.map((p, i) => ({
          publisher_id: p.id,
          order: i
        })),
        preferences: item.preferences.map(p => ({
          publisher_id: p.id
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
        <div className="form-title-modern">Editar arranjo</div>

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
          handleClick={opt => {
            const fixed = opt === "Fixo"
            setIsFixed(fixed)
            if (fixed) {
              setValue("date", undefined)
            } else {
              setWeekday(null)
            }
          }}
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
          <div className="flex flex-col gap-1.5 my-1">
            <Calendar
              label="Data específica do arranjo:"
              selectedDate={watch("date") || null}
              handleDateChange={date =>
                setValue("date", date ?? undefined, { shouldDirty: true, shouldValidate: true })
              }
              minDate={dayjs().format("YYYY-MM-DD")}
              full
            />
            {errors.date && (
              <span className="text-xs text-red-500 font-medium">
                {errors.date.message}
              </span>
            )}
          </div>
        )}

        {/* Seção de Horários */}
        <div className="flex flex-col gap-3 sm:gap-4 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 pb-2 border-b border-surface-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-primary-100/40 text-primary-200 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-typography-800">
                    Turnos e Horários
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-200 text-typography-700 whitespace-nowrap">
                    {fields.length} {fields.length === 1 ? "turno" : "turnos"}
                  </span>
                </div>
                <span className="text-[11px] text-typography-500 block leading-tight mt-0.5">
                  Configure os períodos e a equipe de publicadores
                </span>
              </div>
            </div>
          </div>

          {fields.map((field, index) => {
            const isRotative = watch(`timeSlots.${index}.is_rotative`) ?? false
            const startTime = watch(`timeSlots.${index}.start_time`)
            const endTime = watch(`timeSlots.${index}.end_time`)

            return (
              <div
                key={field.id}
                className="relative rounded-2xl border border-surface-300 bg-surface-100/60 dark:bg-surface-800/30 p-3.5 sm:p-5 shadow-xs transition hover:border-surface-400 flex flex-col gap-3.5 sm:gap-4"
              >
                {/* Header do card do turno */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-surface-200 dark:border-surface-700/60">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary-200/15 text-primary-200 text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-typography-800 shrink-0">
                      Turno {index + 1}
                    </span>
                    {startTime && endTime && (
                      <span className="font-mono text-[11px] text-typography-600 bg-surface-200/80 dark:bg-surface-700/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {startTime.slice(0, 5)} – {endTime.slice(0, 5)}
                      </span>
                    )}
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(index)
                        setSlotPublishers(prev => prev.filter((_, i) => i !== index))
                        setSlotPreferences(prev => prev.filter((_, i) => i !== index))
                      }}
                      className="text-typography-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition shrink-0 ml-auto"
                      title="Remover este horário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Grid de Horários */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Input
                    placeholder="Horário de Início"
                    type="time"
                    registro={{ ...register(`timeSlots.${index}.start_time`) }}
                  />
                  <Input
                    placeholder="Horário de Término"
                    type="time"
                    registro={{ ...register(`timeSlots.${index}.end_time`) }}
                  />
                </div>

                {isFixed ? (
                  <>
                    {/* Alternância Rodízio / Fixo */}
                    <div className="rounded-xl border border-surface-200 dark:border-surface-700/50 bg-surface-200/40 p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw
                            className={`w-4 h-4 ${
                              isRotative ? "text-primary-200" : "text-typography-400"
                            }`}
                          />
                          <span className="text-xs font-semibold text-typography-800">
                            Modo Rodízio Automático
                          </span>
                        </div>
                        <CheckboxBoolean
                          id={`rotative-edit-${index}`}
                          checked={isRotative}
                          handleCheckboxChange={checked =>
                            setValue(`timeSlots.${index}.is_rotative`, checked, {
                              shouldDirty: true
                            })
                          }
                        />
                      </div>
                      <p className="text-[11px] text-typography-500">
                        {isRotative
                          ? "O sistema distribui publicadores rotativamente a cada escala mensal."
                          : "Publicadores específicos fixos designados diretamente para este horário."}
                      </p>
                    </div>

                    {/* Seletores de Publicadores */}
                    {!isRotative ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider">
                          Publicadores Fixos do Horário
                        </span>
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
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider">
                          Preferência de Publicadores (Opcional)
                        </span>
                        <DropdownMulti<IPublicWitnessPublisher>
                          title="Preferência de publicadores para este horário"
                          items={publishers ?? []}
                          selectedItems={slotPreferences[index] ?? []}
                          handleChange={items => {
                            setSlotPreferences(prev => {
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
                        <span className="text-[11px] text-typography-500 italic px-0.5">
                          Publicadores com preferência definida apenas neste horário nunca serão colocados em outro pelo gerador automático.
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  /* Para data específica: 100% manual e direto */
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider">
                      Publicadores do Horário
                    </span>
                    <DropdownMulti<IPublicWitnessPublisher>
                      title="Selecione os publicadores deste horário"
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
                  </div>
                )}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => {
              append({ start_time: "", end_time: "", is_rotative: false })
              setSlotPublishers(prev => [...prev, []])
              setSlotPreferences(prev => [...prev, []])
            }}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary-200/50 hover:border-primary-200 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 text-primary-200 dark:text-primary-300 font-semibold text-xs flex items-center justify-center gap-2 transition group shadow-2xs"
          >
            <div className="w-5 h-5 rounded-full bg-primary-200/15 group-hover:bg-primary-200/25 flex items-center justify-center transition">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span>Adicionar outro horário</span>
          </button>
        </div>

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
