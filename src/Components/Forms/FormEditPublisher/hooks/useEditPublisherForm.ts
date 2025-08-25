import {
    genderOptions,
    hopeOptions,
    pioneerOptions,
    privilegeOptions,
    situationOptions,
} from "@/constants/publisherOptions"
import { usePublisherContext } from "@/context/PublisherContext"
import { IPublisher, Privileges } from "@/entities/types"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { getMonthsByYear, getYearService } from "@/functions/meses"
import { useFetch } from "@/hooks/useFetch"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { FormValues } from "../type"
import { publisherEditSchema } from "../validations"

export function useEditPublisherForm(id: string) {
  const { updatePublisher } = usePublisherContext()
  const { data } = useFetch<IPublisher>(`/publisher/${id}`)

  // ---------------- States ----------------
  const [publisherToUpdate, setPublisherToUpdate] = useState<IPublisher>()
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>("")
  const [privilegeCheckboxSelected, setPrivilegeCheckboxSelected] = useState("")
  const [auxPioneerMonthsSelected, setAuxPioneerMonthsSelected] = useState<string[]>([])
  const [hopeCheckboxSelected, setHopeCheckboxSelected] = useState<string>("")
  const [pioneerCheckboxSelected, setPioneerCheckboxSelected] = useState<string>("")
  const [situationPublisherCheckboxSelected, setSituationPublisherCheckboxSelected] = useState<string>("")
  const [immersedDate, setImmersedDate] = useState<Date | null>(null)
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [startPioneer, setStartPioneer] = useState<Date | null>(null)
  const [allPrivileges, setAllPrivileges] = useState<string[]>([])
  const [yearService, setYearService] = useState(getYearService().toString())

  // ---------------- Form ----------------
  const formMethods = useForm<FormValues>({
    resolver: yupResolver(publisherEditSchema),
  })

  const { register, reset, watch } = formMethods

  // ---------------- Options for months ----------------
  const serviceYearActual = getMonthsByYear(yearService).months
  const lastServiceYear = getMonthsByYear((Number(yearService) - 1).toString()).months

  const normalizeMonths = (months: string[]) =>
    months.map(month => {
      const [m, y] = month.split(" ")
      return `${capitalizeFirstLetter(m)}-${y}`
    })

  const optionsPioneerMonthsServiceYearActual = [...normalizeMonths(serviceYearActual)]
  const optionsPioneerMonthsLastServiceYear = [...normalizeMonths(lastServiceYear)]

  // ---------------- Effects ----------------
  useEffect(() => {
    if (data) {
      const isPrivilege = data.privileges.filter(p => privilegeOptions.includes(p as Privileges))
      const isPioneer = data.privileges.filter(p => pioneerOptions.includes(p as Privileges))

      setPublisherToUpdate(data)
      setGenderCheckboxSelected(data.gender)
      setSituationPublisherCheckboxSelected(data.situation)
      setPrivilegeCheckboxSelected(isPrivilege[0])
      setPioneerCheckboxSelected(isPioneer[0])
      setAllPrivileges(data.privileges || [])
      setAuxPioneerMonthsSelected(data.pioneerMonths || [])
      setHopeCheckboxSelected(data.hope)
      setBirthDate(data.birthDate ? new Date(data.birthDate) : null)
      setImmersedDate(data.dateImmersed ? new Date(data.dateImmersed) : null)
      setStartPioneer(data.startPioneer ? new Date(data.startPioneer) : null)

      reset({
        fullName: data.fullName || "",
        nickname: data.nickname || "",
        address: data.address || "",
        phone: data.phone || "",
      })
    }
  }, [data, reset])

  useEffect(() => {
    const updatedPrivileges: string[] = []
    if (pioneerCheckboxSelected) updatedPrivileges.push(pioneerCheckboxSelected)
    if (privilegeCheckboxSelected) updatedPrivileges.push(privilegeCheckboxSelected)
    setAllPrivileges(updatedPrivileges)
  }, [pioneerCheckboxSelected, privilegeCheckboxSelected])

  useEffect(() => {
    // simplificação: usar react-hook-form isDirty poderia substituir isso
    setIsFormChanged(formMethods.formState.isDirty)
  }, [formMethods.formState.isDirty])

  // ---------------- Handlers ----------------
  const handlers = {
    handleCheckboxGender: setGenderCheckboxSelected,
    handleCheckboxHope: setHopeCheckboxSelected,
    handleCheckboxPioneer: setPioneerCheckboxSelected,
    handleCheckboxSituationPublisher: setSituationPublisherCheckboxSelected,
    handleCheckboxPrivileges: setPrivilegeCheckboxSelected,
    handleBirthDateChange: setBirthDate,
    handleAuxPioneerMonths: setAuxPioneerMonthsSelected,
    handleImmersedDateChange: setImmersedDate,
    handleStartPioneerDateChange: setStartPioneer,
  }

  // ---------------- Submit ----------------
  const onSubmit = (formData: FormValues) => {
    toast.promise(
      updatePublisher(
        id,
        formData.fullName,
        publisherToUpdate?.congregation?.id ?? "",
        genderCheckboxSelected,
        hopeCheckboxSelected,
        allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR],
        formData.nickname,
        immersedDate ?? undefined,
        birthDate ?? undefined,
        auxPioneerMonthsSelected,
        situationPublisherCheckboxSelected,
        startPioneer ?? undefined,
        formData.address,
        formData.phone
      ),
      { pending: "Atualizando publicador" }
    )
  }

  const onError = () => toast.error("Aconteceu algum erro! Confira todos os campos.")

  return {
    data,
    formMethods,
    isFormChanged,
    handlers,
    onSubmit,
    onError,
    // options que a view precisa
    options: {
      genderOptions,
      hopeOptions,
      situationOptions,
      privilegeOptions,
      pioneerOptions,
      optionsPioneerMonthsServiceYearActual,
      optionsPioneerMonthsLastServiceYear,
    },
    values: {
      birthDate,
      immersedDate,
      startPioneer,
      genderCheckboxSelected,
      hopeCheckboxSelected,
      pioneerCheckboxSelected,
      privilegeCheckboxSelected,
      situationPublisherCheckboxSelected,
      auxPioneerMonthsSelected,
    },
  }
}
