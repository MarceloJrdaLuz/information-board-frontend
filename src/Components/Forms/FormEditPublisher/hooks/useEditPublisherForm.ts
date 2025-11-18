import { showModalEmergencyContact } from "@/atoms/atom"
import {
  additionalsPrivilegeOptions,
  genderOptions,
  hopeOptions,
  pioneerOptions,
  privilegeOptions,
  situationOptions,
} from "@/constants/publisherOptions"
import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { getMonthsByYear, getYearService } from "@/functions/meses"
import { useFetch } from "@/hooks/useFetch"
import { usePublisher } from "@/hooks/usePublisher"
import { IPayloadUpdatePublisher } from "@/types/publishers"
import { IPublisher, Privileges } from "@/types/types"
import { yupResolver } from "@hookform/resolvers/yup"
import { useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { FormValues } from "../type"
import { publisherEditSchema } from "../validations"

export function useEditPublisherForm(id: string) {
  const { updatePublisher } = usePublisher()
  const { data } = useFetch<IPublisher>(`/publisher/${id}`)

  // ---------------- States ----------------
  const [publisherToUpdate, setPublisherToUpdate] = useState<IPublisher>()
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [genderCheckboxSelected, setGenderCheckboxSelected] = useState<string>("")
  const [additionalsPrivilegeCheckboxSelected, setAdditionalsPrivilegeCheckboxSelected] = useState<string[]>([])
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
  const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<string | null>(null)
  const setModalEmergencyContactShowAtom = useSetAtom(showModalEmergencyContact)



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
      const isAditionalsPrivileges = data.privileges.filter(p => additionalsPrivilegeOptions.includes(p as Privileges))

      setAdditionalsPrivilegeCheckboxSelected(isAditionalsPrivileges)
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
      setSelectedEmergencyContact(data.emergencyContact?.id || null)
      data.emergencyContact?.id && setModalEmergencyContactShowAtom(true)

      reset({
        fullName: data.fullName || "",
        nickname: data.nickname || "",
        address: data.address || "",
        phone: data.phone || "",
      })
    }
  }, [data, reset, setModalEmergencyContactShowAtom])

  useEffect(() => {
    const updatedPrivileges: string[] = []
    if (pioneerCheckboxSelected) updatedPrivileges.push(pioneerCheckboxSelected)
    if (privilegeCheckboxSelected) updatedPrivileges.push(privilegeCheckboxSelected)
    if (additionalsPrivilegeCheckboxSelected.length > 0) {
      updatedPrivileges.push(...additionalsPrivilegeCheckboxSelected)
    }
    setAllPrivileges(updatedPrivileges)
  }, [pioneerCheckboxSelected, privilegeCheckboxSelected, additionalsPrivilegeCheckboxSelected])

  useEffect(() => {
    setIsFormChanged(formMethods.formState.isDirty)
  }, [formMethods.formState.isDirty])

  // ---------------- Handlers ----------------
  const handlers = {
    handleCheckboxGender: setGenderCheckboxSelected,
    handleCheckboxHope: setHopeCheckboxSelected,
    handleCheckboxPioneer: setPioneerCheckboxSelected,
    handleCheckboxSituationPublisher: setSituationPublisherCheckboxSelected,
    handleCheckboxPrivileges: setPrivilegeCheckboxSelected,
    handleCheckboxAdditionalPrivileges: setAdditionalsPrivilegeCheckboxSelected,
    handleBirthDateChange: setBirthDate,
    handleAuxPioneerMonths: setAuxPioneerMonthsSelected,
    handleImmersedDateChange: setImmersedDate,
    handleStartPioneerDateChange: setStartPioneer,
    handleSelectedEmergencyContactChange: setSelectedEmergencyContact,
  }

  // ---------------- Submit ----------------
  const onSubmit = (data: FormValues) => {
    const { address, fullName, nickname, phone } = data
    const payload: IPayloadUpdatePublisher = {
      fullName,
      address,
      birthDate: birthDate ?? undefined,
      dateImmersed: immersedDate ?? undefined,
      emergencyContact_id: selectedEmergencyContact ?? undefined,
      gender: genderCheckboxSelected,
      hope: hopeCheckboxSelected,
      nickname,
      phone,
      pioneerMonths: auxPioneerMonthsSelected,
      privileges: allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR],
      situation: situationPublisherCheckboxSelected,
      startPioneer: startPioneer ?? undefined
    }
    toast.promise(
      updatePublisher(publisherToUpdate?.id ?? "", payload),
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
    setYearService,
    // options que a view precisa
    options: {
      genderOptions,
      hopeOptions,
      situationOptions,
      privilegeOptions,
      additionalsPrivilegeOptions,
      pioneerOptions,
      optionsPioneerMonthsServiceYearActual,
      optionsPioneerMonthsLastServiceYear
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
      yearService,
      additionalsPrivilegeCheckboxSelected,
      selectedEmergencyContact
    },
  }
}
