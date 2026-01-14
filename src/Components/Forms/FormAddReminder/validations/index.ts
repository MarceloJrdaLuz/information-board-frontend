import * as yup from "yup"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
dayjs.extend(isSameOrAfter)

export const createReminderSchema = yup.object({
  title: yup.string().required("Campo obrigatório"),

  description: yup.string().nullable(),

  startDate: yup
    .string()
    .nullable()
    .required("Data inicial obrigatória"),

  endDate: yup
    .string()
    .nullable()
    .required("Data final obrigatória")
    .test(
      "end-after-start",
      "A data final não pode ser menor que a inicial",
      function (value) {
        const { startDate } = this.parent
        if (!startDate || !value) return true
        return dayjs(value).isSameOrAfter(dayjs(startDate), "day")
      }
    ),

  isRecurring: yup.boolean().required(),

  recurrenceType: yup.string().when("isRecurring", {
    is: true,
    then: (schema) => schema.required("Selecione o tipo de repetição"),
    otherwise: (schema) => schema.nullable().strip()
  }),

  recurrenceInterval: yup
    .number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .when("isRecurring", {
      is: true,
      then: (schema) => schema.required("Obrigatório").min(1, "Mínimo 1"),
      otherwise: (schema) => schema.nullable().strip()
    }),

  recurrenceCount: yup
    .number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .when("isRecurring", {
      is: true,
      then: (schema) => schema.min(1, "Mínimo 1"),
      otherwise: (schema) => schema.nullable().strip() // Remove do objeto apenas se NÃO for recorrente
    })
})
