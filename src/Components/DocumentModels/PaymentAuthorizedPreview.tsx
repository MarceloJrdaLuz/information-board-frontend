import React from "react";
import { IPaymentAuthorizedData } from "@/types/documentModels";
import { formatLongDate } from "@/utils/letterParser";

interface Props {
    data: IPaymentAuthorizedData;
}

export default function PaymentAuthorizedPreview({ data }: Props) {
    const formattedDate = formatLongDate(data.date);
    const validSignatures = (data.signatures || []).filter(
        s => s.name?.trim() || s.role?.trim()
    );

    const validBrothers = (data.authorizedBrothers || []).filter(b => b?.trim());

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
                    <h1 className="text-center font-bold text-[16px] text-zinc-900 mb-8">
                        {data.title || "Autorizados a fazer pagamentos"}
                    </h1>

                    <div className="space-y-1 mb-6 text-[14px] text-zinc-800">
                        <div>
                            Data: <span className="font-semibold">{formattedDate || "____/____/________"}</span>
                        </div>
                        <div>
                            Congregação:{" "}
                            <span className="font-semibold">
                                {data.congregationName || "________________________"}
                                {data.congregationState ? ` - ${data.congregationState}` : ""}
                            </span>
                        </div>
                    </div>

                    <div className="text-justify leading-relaxed whitespace-pre-wrap text-zinc-800 text-[14px] mb-4">
                        {data.bodyText || "Irmãos autorizados a fazer pagamentos usando a conta da congregação:"}
                    </div>

                    <div className="space-y-2 pl-4 py-2 my-4 border-l-2 border-primary-200/30">
                        {validBrothers.length === 0 ? (
                            <span className="text-zinc-400 italic text-xs">
                                Nenhum irmão adicionado à lista.
                            </span>
                        ) : (
                            validBrothers.map((brother, idx) => (
                                <div key={idx} className="font-bold text-zinc-900 text-[15px]">
                                    {brother}
                                </div>
                            ))
                        )}
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

