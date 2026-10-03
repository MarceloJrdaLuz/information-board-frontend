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
import { IPublisher, PrivilegeCode, Privileges } from "@/types/types"
import { getActivePrivilegeLabels, getPublisherStartDate, hasPrivilege } from "@/functions/publisherPrivilegeHelper"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { FormValues } from "../type"
import { publisherEditSchema } from "../validations"

export function useEditPublisherForm(id: string) {
  const { updatePublisher } = usePublisher()
  const { data, mutate } = useFetch<IPublisher>(`/publisher/${id}`)

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
  const [immersedDate, setImmersedDate] = useState<string | null>(null)
  const [birthDate, setBirthDate] = useState<string | null>(null)
  const [isPublisherApproved, setIsPublisherApproved] = useState<boolean>(true)
  const [startDatePublisher, setStartDatePublisher] = useState<string | null>(null)
  const [startPioneer, setStartPioneer] = useState<string | null>(null)
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
      let normalizedPrivileges = (data.privileges || []).map(p =>
        p === Privileges.AUXILIARINDETERMINADO ? Privileges.AUXILIARTEMPOINDETERMINADO : p
      )

      if (normalizedPrivileges.length === 0 && data.privilegesRelation) {
        normalizedPrivileges = getActivePrivilegeLabels(data)
      }

      let pioneerMonthsList = data.pioneerMonths || []
      if ((!pioneerMonthsList || pioneerMonthsList.length === 0) && data.privilegesRelation) {
        const auxRelMonths = data.privilegesRelation
          .filter(pp => 
            (pp.privilege?.code === PrivilegeCode.AUXILIARY_PIONEER || pp.privilege?.name === "Auxiliary Pioneer") && 
            pp.startDate
          )
          .map(pp => {
            const d = dayjs(pp.startDate)
            const m = d.locale("pt-br").format("MMMM")
            const y = d.format("YYYY")
            return `${capitalizeFirstLetter(m)}-${y}`
          })
        if (auxRelMonths.length > 0) {
          pioneerMonthsList = auxRelMonths
        }
      }

      const isPrivilege = normalizedPrivileges.filter(p => privilegeOptions.includes(p as Privileges))
      const isPioneer = normalizedPrivileges.filter(p => pioneerOptions.includes(p as Privileges))
      const isAditionalsPrivileges = normalizedPrivileges.filter(p => additionalsPrivilegeOptions.includes(p as Privileges))

      setAdditionalsPrivilegeCheckboxSelected(isAditionalsPrivileges)
      setPublisherToUpdate(data)
      setGenderCheckboxSelected(data.gender)
      setSituationPublisherCheckboxSelected(data.situation)
      setPrivilegeCheckboxSelected(isPrivilege[0])
      setPioneerCheckboxSelected(isPioneer[0])
      setAllPrivileges(normalizedPrivileges)
      setAuxPioneerMonthsSelected(pioneerMonthsList)
      setHopeCheckboxSelected(data.hope)
      setBirthDate(data.birthDate ? data.birthDate : null)
      setImmersedDate(data.dateImmersed ? data.dateImmersed : null)
      const pubStartDate = getPublisherStartDate(data) || data.startDatePublisher || null
      setStartDatePublisher(pubStartDate)
      const isApproved = hasPrivilege(data, PrivilegeCode.PUBLISHER)
      setIsPublisherApproved(isApproved)
      setStartPioneer(data.startPioneer ? data.startPioneer : null)
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
    handleIsPublisherApprovedChange: (approved: boolean) => {
      setIsPublisherApproved(approved)
      if (!approved) {
        setPrivilegeCheckboxSelected('')
        setPioneerCheckboxSelected('')
        setAdditionalsPrivilegeCheckboxSelected([])
        setAuxPioneerMonthsSelected([])
        setStartPioneer(null)
        setStartDatePublisher(null)
      }
    },
    handleStartDatePublisherChange: setStartDatePublisher,
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
      startDatePublisher: isPublisherApproved ? (startDatePublisher ?? undefined) : null,
      emergencyContact_id: selectedEmergencyContact ?? undefined,
      gender: genderCheckboxSelected,
      hope: hopeCheckboxSelected,
      nickname,
      phone,
      pioneerMonths: isPublisherApproved ? auxPioneerMonthsSelected : [],
      privileges: isPublisherApproved
        ? (allPrivileges.length > 0 ? allPrivileges : [Privileges.PUBLICADOR])
        : [],
      situation: situationPublisherCheckboxSelected,
      startPioneer: isPublisherApproved ? (startPioneer ?? undefined) : null
    }
    toast.promise(
      updatePublisher(publisherToUpdate?.id ?? "", payload),
      { pending: "Atualizando pessoa" }
    ).then(() => {

    }).catch(err => {
      console.log(err)
    })
  }

  const onError = () => toast.error("Aconteceu algum erro! Confira todos os campos.")

  return {
    data,
    mutate,
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
      isPublisherApproved,
      startDatePublisher,
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
