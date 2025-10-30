export type CreateTermOfUsePayload = {
  type: "congregation" | "publisher",
  title: string,
  version: string,
  content: string
  is_active: boolean
}

