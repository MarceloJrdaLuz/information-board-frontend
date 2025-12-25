import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import PdfIcon from "@/Components/Icons/PdfIcon"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { FieldServiceFixedSchedule, FieldServiceRotationBlock } from "@/types/fieldService"
import { BlobProvider } from "@react-pdf/renderer"
import { useState } from "react"
import { FieldServiceSchedulePdf } from ".."
import { API_ROUTES } from "@/constants/apiRoutes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"

/* ===== Tipos ===== */
interface PdfLinkComponentProps {
  fixedSchedules: FieldServiceFixedSchedule[]
  rotationBlocks: FieldServiceRotationBlock[]
  congregationName?: string
}

/* ===== Component ===== */
export function PdfLinkComponent({
  fixedSchedules,
  rotationBlocks,
  congregationName,
}: PdfLinkComponentProps) {
  if (fixedSchedules.length === 0 && rotationBlocks.length === 0) {
    return null
  }

  return (
    <BlobProvider
      document={
        <FieldServiceSchedulePdf
          fixedSchedules={fixedSchedules}
          rotationBlocks={rotationBlocks}
          congregationName={congregationName}
        />
      }
    >
      {({ blob, url, loading, error }) => {
        const isDisabled = loading || !!error || !blob

        return (
          <a
            href={url || "#"}
            download={url ? "Programação do Ministério de Campo.pdf" : undefined}
            className={isDisabled ? "pointer-events-none" : ""}
          >
            <Button
              outline
              disabled={isDisabled}
              className="bg-surface-100 w-56 text-primary-200 p-1 md:p-3 border-typography-300 rounded-none hover:opacity-80"
            >
              <PdfIcon />
              <span className="font-semibold">
                {loading ? "Gerando PDF..." : "Gerar PDF"}
              </span>
            </Button>
          </a>
        )
      }}
    </BlobProvider>
  )
}


interface PdfDownloadCardProps {
  congregationId: string
}

export function FieldServicePdfDownload({ congregationId }: PdfDownloadCardProps) {
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [shouldFetch, setShouldFetch] = useState(false)
  const [pdfScale, setPdfScale] = useState(1);


  const { data, error, isLoading } = useAuthorizedFetch<{
    fixedSchedules: FieldServiceFixedSchedule[]
    rotationBlocks: FieldServiceRotationBlock[]
  }>(
    shouldFetch && start && end
      ? `${API_ROUTES.FIELD_SERVICE_SCHEDULES}/pdf/congregation/${congregationId}?start=${start}&end=${end}`
      : "",
    { allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"] }
  )

  // Quando o usuário clica no botão, ativa o fetch
  const handleFetchSchedules = () => {
    if (!start || !end) return
    setShouldFetch(true)
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface-100 ">
      <Calendar
        label="Data inicial"
        selectedDate={start}
        handleDateChange={setStart}
        full
      />
      <Calendar
        label="Data final"
        selectedDate={end}
        handleDateChange={setEnd}
        minDate={start}
        full
      />

      {/* CAMPO DE ESCALA COM LABEL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-typography-600">
          Ajuste de escala (Tamanho do conteúdo)
        </label>
        <Select value={pdfScale.toString()} onValueChange={v => setPdfScale(Number(v))}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Selecione a escala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">100%</SelectItem>
            <SelectItem value="0.95">95%</SelectItem>
            <SelectItem value="0.9">90%</SelectItem>
            <SelectItem value="0.85">85%</SelectItem>
            <SelectItem value="0.8">80%</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-typography-500 italic">
          * Use escalas menores se a programação não couber em uma única folha.
        </p>
      </div>

      <Button onClick={handleFetchSchedules} className="w-full">
        Gerar
      </Button>

      {
        data && (data.fixedSchedules.length > 0 || data.rotationBlocks.length > 0) && (
          <BlobProvider
            document={
              <FieldServiceSchedulePdf
                congregationName=""
                fixedSchedules={data.fixedSchedules}
                rotationBlocks={data.rotationBlocks}
                scale={pdfScale}
              />
            }
          >
            {({ url, loading }) => (
              <a
                href={url || "#"}
                download="Programacao_Ministerio_Campo.pdf"
                className={loading ? "pointer-events-none" : ""}
              >
                <Button outline className="w-full flex justify-center gap-2">
                  <PdfIcon />
                  {loading ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              </a>
            )}
          </BlobProvider>
        )
      }

      {error && <p className="text-red-500">Erro ao buscar programação.</p>}
    </div >
  )
}

