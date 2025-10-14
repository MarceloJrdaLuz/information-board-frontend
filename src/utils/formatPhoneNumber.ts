export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  return phone.replace(/\D/g, "") // remove tudo que não for número
}
