import React from "react";
import { IWorldwideWorkResolutionData } from "@/types/documentModels";

interface Props {
    data: IWorldwideWorkResolutionData;
}

export default function WorldwideWorkResolutionPreview({ data }: Props) {
    const validSignatures = (data.signatures || []).filter(
        s => s.name?.trim() || s.role?.trim()
    );

    const congFull = [
        data.congregationName || "________________________",
        data.congregationState,
    ]
        .filter(Boolean)
        .join(" ");

    const congWithNumber = data.congregationNumber
        ? `${congFull} (${data.congregationNumber})`
        : congFull;

    const defaultText = `A congregação ${congWithNumber} decidiu fazer um donativo mensal para a obra mundial no valor de R$ ${
        data.monthlyAmount || "150,00"
    } para o ano de serviço de ${
        data.serviceYear || "2027"
    }. Esse donativo mensal será retirado da caixa de donativos feitos para a congregação local.`;

    const textToRender = data.bodyText?.trim() || defaultText;

    return (
        <div className="w-full flex justify-center py-4 overflow-x-auto">
            <div
                className="bg-white text-zinc-900 shadow-xl border border-zinc-200/80 rounded-sm flex flex-col justify-between transition-all"
                style={{
                    width: "100%",
                    maxWidth: "760px",
                    minHeight: "980px",
                    padding: "54px 56px",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: "14px",
                    lineHeight: "1.7",
                }}
            >
                <div>
                    <h1 className="text-center font-bold text-[16px] text-zinc-900 mb-10 pb-3 border-b border-zinc-200">
                        {data.title || "Resolução para Obra Mundial"}
                    </h1>

                    <div className="text-justify leading-relaxed whitespace-pre-wrap text-zinc-800 text-[14px]">
                        {textToRender}
                    </div>

                    {data.additionalNotes && (
                        <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 text-xs text-zinc-600 italic">
                            <strong>Observações:</strong> {data.additionalNotes}
                        </div>
                    )}
                </div>

                <div>
                    {validSignatures.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 pb-12 items-end">
                            {validSignatures.map((sig, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center">
                                    <span className="font-bold text-[12px] text-zinc-900 mb-1.5 min-h-[18px]">
                                        {sig.name || "\u00A0"}
                                    </span>
                                    <div className="w-full border-t border-zinc-900 mb-1.5" />
                                    <span className="text-[11px] text-zinc-600">
                                        {sig.role || "Ancião"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{data.documentTitle}</span>
                        <span>Página 1 de 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

