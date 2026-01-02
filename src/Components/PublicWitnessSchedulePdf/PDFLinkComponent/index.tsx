import { BlobProvider } from "@react-pdf/renderer"
import { useState } from "react"

import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import PdfIcon from "@/Components/Icons/PdfIcon"

import { useAuthorizedFetch } from "@/hooks/useFetch"

import {
    IPublicWitnessFixedSchedule,
} from "@/types/publicWitness/schedules"

import { CollapsibleCard } from "@/Components/CollapsibleCard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { IPublicWitnessRotationBlock, PublicWitnessSchedulePdf } from ".."

/* ======================================================
 *  PROPS
 * ====================================================== */
interface PublicWitnessPdfDownloadProps {
    congregationId: string
}

/* ======================================================
 *  COMPONENT
 * ====================================================== */
export function PublicWitnessPdfDownload({
    congregationId,
}: PublicWitnessPdfDownloadProps) {
    const [start, setStart] = useState<string | null>(null)
    const [end, setEnd] = useState<string | null>(null)
    const [pdfScale, setPdfScale] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(false)

    const { data, error, isLoading } = useAuthorizedFetch<{
        fixedSchedules: IPublicWitnessFixedSchedule[]
        rotationBlocks: IPublicWitnessRotationBlock[]
    }>(
        shouldFetch && start && end
            ? `/public-witness/schedules/pdf/congregation/${congregationId}?start=${start}&end=${end}`
            : "",
        { allowedRoles: ["ADMIN_CONGREGATION", "PUBLIC_WITNESS_MANAGER"] }
    )

    /* ======================================================
     *  HANDLERS
     * ====================================================== */
    const handleGenerate = () => {
        if (!start || !end) return
        setShouldFetch(true)
    }

    const hasData =
        data &&
        (data.fixedSchedules.length > 0 || data.rotationBlocks.length > 0)

    /* ======================================================
     *  RENDER
     * ====================================================== */
    return (
        <CollapsibleCard full title="Gerar PDF" defaultOpen={false}>
            <div className="flex flex-col gap-4 p-4 bg-surface-100">
                {/* ================= DATA INICIAL ================= */}
                <Calendar
                    label="Data inicial"
                    selectedDate={start}
                    handleDateChange={setStart}
                    full
                />

                {/* ================= DATA FINAL ================= */}
                <Calendar
                    label="Data final"
                    selectedDate={end}
                    handleDateChange={setEnd}
                    minDate={start}
                    full
                />

                {/* ================= ESCALA ================= */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-typography-600">
                        Ajuste de escala (tamanho do conteúdo)
                    </label>

                    <Select
                        value={pdfScale.toString()}
                        onValueChange={v => setPdfScale(Number(v))}
                    >
                        <SelectTrigger className="w-full bg-surface-100 text-typography-700">
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

                {/* ================= GERAR ================= */}
                <Button
                    onClick={handleGenerate}
                    disabled={!start || !end || isLoading}
                    className="w-full"
                >
                    {isLoading ? "Buscando programação..." : "Gerar"}
                </Button>

                {/* ================= PDF ================= */}
                {hasData && (
                    <BlobProvider
                        document={
                            <PublicWitnessSchedulePdf
                                congregationName=""
                                fixedSchedules={data.fixedSchedules}
                                rotationBlocks={data.rotationBlocks}
                                scale={pdfScale}
                            />
                        }
                    >
                        {({ url, loading, error }) => {
                            const disabled = loading || !!error || !url

                            return (
                                <a
                                    href={url || "#"}
                                    download="Programacao_Testemunho_Publico.pdf"
                                    className={disabled ? "pointer-events-none" : ""}
                                >
                                    <Button
                                        outline
                                        disabled={disabled}
                                        className="w-full flex justify-center gap-2"
                                    >
                                        <PdfIcon />
                                        {loading ? "Gerando PDF..." : "Baixar PDF"}
                                    </Button>
                                </a>
                            )
                        }}
                    </BlobProvider>
                )}

                {error && (
                    <p className="text-sm text-red-500">
                        Erro ao buscar a programação.
                    </p>
                )}
            </div>
        </CollapsibleCard>
    )
}
