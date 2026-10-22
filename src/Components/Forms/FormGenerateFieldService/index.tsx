import Calendar from "@/Components/Calendar"
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
    <div className="space-y-4">
      <Dropdown
        title="Template"
        border
        full
        textVisible
        options={templates.map((t: any) => t.name)}
        handleClick={(name) =>
          setTemplateId(templates.find((t: any) => t.name === name).id)
        }
      />

      <Calendar
        label="Data Inicial"
        selectedDate={startDate || null}
        handleDateChange={(d) => setStartDate(d || "")}
        full
      />
      <Calendar
        label="Data Final"
        selectedDate={endDate || null}
        minDate={startDate || null}
        handleDateChange={(d) => setEndDate(d || "")}
        full
      />

      <Dropdown
        title="Modo"
        border
        full
        textVisible
        options={["append", "reconcile"]}
        handleClick={(v) => setMode(v as any)}
      />

      <div className="w-full pt-2">
        <Button className="w-full text-typography-200" onClick={handleGenerate}>
          Gerar programação
        </Button>
      </div>
    </div>
  )
}
