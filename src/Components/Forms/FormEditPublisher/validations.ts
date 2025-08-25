import * as yup from "yup"

export const publisherEditSchema = yup.object({
  fullName: yup.string().required("Campo obrigatório"),
  nickname: yup.string(),
  address: yup.string(),
  phone: yup
    .string()
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
})
