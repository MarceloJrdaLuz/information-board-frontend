import Button from "@/Components/Button"
import Input from "@/Components/Input"
import Dropdown from "@/Components/Dropdown"
import { useState } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"

export default function FormGenerateFieldService({ templates }: any) {
  const [templateId, setTemplateId] = useState<string>()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [mode, setMode] = useState<"append" | "reconcile">("append")

  async function handleGenerate() {
    await toast.promise(
      api.post("/field-service/generate", {
        template_id: templateId,
        startDate,
        endDate,
        mode,
      }),
      { pending: "Gerando programação..." }
    )
  }

  return (
    <div className="space-y-3">
      <Dropdown
        title="Template"
        options={templates.map((t: any) => t.name)}
        handleClick={(name) =>
          setTemplateId(templates.find((t: any) => t.name === name).id)
        }
      />

      <Input type="date" onChange={(e) => setStartDate(e.target.value)} />
      <Input type="date" onChange={(e) => setEndDate(e.target.value)} />

      <Dropdown
        title="Modo"
        options={["append", "reconcile"]}
        handleClick={(v) => setMode(v as any)}
      />

      <Button onClick={handleGenerate}>
        Gerar programação
      </Button>
    </div>
  )
}
