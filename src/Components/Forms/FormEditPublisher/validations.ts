import * as yup from "yup"

export const publisherEditSchema = yup.object({
  fullName: yup.string().required("Campo obrigatório"),
  nickname: yup.string(),
  address: yup.string(),
  phone: yup
    .string()
    .nullable()
    .notRequired()
    .test('is-valid-phone', 'Telefone inválido', value => {
      if (!value) return true; // aceita vazio
      return /^\(\d{2}\) \d{5}-\d{4}$/.test(value); // valida formato se preenchido
    })
})
