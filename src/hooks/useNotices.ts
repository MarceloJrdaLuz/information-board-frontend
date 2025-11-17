import { useState, useEffect } from "react"
import { api } from "@/services/api"
import { useSubmit } from "@/hooks/useSubmitForms"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { ICongregation } from "@/types/types"
import { useFetch } from "@/hooks/useFetch"

export function useNotices(congregationNumber: string) {
  const [expiredNotice, setExpiredNotice] = useState<Date>()
  const [congregationId, setCongregationId] = useState<string | undefined>()

  const { handleSubmitError, handleSubmitSuccess } = useSubmit()
  const fetchConfigCongregationData = congregationNumber ? `/congregation/${congregationNumber}` : ""
  const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

  useEffect(() => {
    if (congregation) {
      setCongregationId(congregation.id)
    }
  }, [congregation])

  async function createNotice(title: string, text: string, startDay?: number, endDay?: number) {
    await api.post(`/notice/${congregationId}`, {
      title,
      text,
      startDay: startDay ?? null,
      endDay: endDay ?? null,
      expired: expiredNotice ?? null
    }).then(() => {
      handleSubmitSuccess(messageSuccessSubmit.noticeCreate)
    }).catch(() => {
      handleSubmitError(messageErrorsSubmit.default)
    })
  }

  async function updateNotice(notice_id: string, title?: string, text?: string, startDay?: number, endDay?: number) {
    await api.put(`/notice/${notice_id}`, {
      title,
      text,
      startDay: startDay ?? null,
      endDay: endDay ?? null,
      expired: expiredNotice ?? null
    }).then(() => {
      handleSubmitSuccess(messageSuccessSubmit.noticeUpdate)
    }).catch(() => {
      handleSubmitError(messageErrorsSubmit.default)
    })
  }

  async function deleteNotice(notice_id: string) {
    await api.delete(`/notice/${notice_id}`).then(() => {
      handleSubmitSuccess(messageSuccessSubmit.noticeDelete)
    }).catch(() => {
      handleSubmitError(messageErrorsSubmit.default)
    })
  }

  return {
    expiredNotice,
    setExpiredNotice,
    createNotice,
    updateNotice,
    deleteNotice
  }
}
