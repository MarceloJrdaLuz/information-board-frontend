import Input from "@/Components/Input"
import Dropdown from "@/Components/Dropdown"
import Button from "@/Components/Button"
import { api } from "@/services/api"
import { toast } from "react-toastify"
import { useState } from "react"

export default function FormAddFieldServiceException({ templates }: any) {
  const [date, setDate] = useState("")
  const [templateId, setTemplateId] = useState<string | null>(null)

  async function handleSubmit() {
    await toast.promise(
      api.post("/field-service/exceptions", {
        date,
        template_id: templateId,
      }),
      { pending: "Criando exceção..." }
    )
  }

  return (
    <div className="space-y-3">
      <Input type="date" onChange={(e) => setDate(e.target.value)} />

      <Dropdown
        title="Template (opcional)"
        options={["Todos", ...templates.map((t: any) => t.name)]}
        handleClick={(v) =>
          setTemplateId(
            v === "Todos" ? null : templates.find((t: any) => t.name === v).id
          )
        }
      />

      <Button onClick={handleSubmit}>
        Criar exceção
      </Button>
    </div>
  )
}
