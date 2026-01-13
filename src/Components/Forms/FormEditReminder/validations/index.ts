import * as yup from "yup"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
dayjs.extend(isSameOrAfter)

export const editReminderSchema = yup.object({
    title: yup.string().required("Campo obrigatório"),

    description: yup.string().nullable(),

    startDate: yup.string().nullable(),

    endDate: yup
        .string()
        .nullable()
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

    recurrenceIntervalDays: yup
        .number()
        .nullable()
        .when("isRecurring", {
            is: true,
            then: (schema) =>
                schema
                    .required("Campo obrigatório")
                    .min(1, "Mínimo 1 dia"),
            otherwise: (schema) => schema.nullable().strip()
        }),

    recurrenceCount: yup
        .number()
        .nullable()
        .when("isRecurring", {
            is: true,
            then: (schema) => schema.min(1, "Mínimo 1"),
            otherwise: (schema) => schema.nullable().strip()
        }),

    isActive: yup.boolean().required()
})
