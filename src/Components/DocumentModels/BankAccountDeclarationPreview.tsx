import React from "react";
import { IBankAccountDeclarationData } from "@/types/documentModels";
import { formatLongDate } from "@/utils/letterParser";

interface Props {
    data: IBankAccountDeclarationData;
}

export default function BankAccountDeclarationPreview({ data }: Props) {
    const formattedDate = formatLongDate(data.date);
    const locationDate = [
        data.city && data.state ? `${data.city} – ${data.state}` : data.city,
        formattedDate,
    ]
        .filter(Boolean)
        .join(", ");

    const defaultText = `Eu ${data.declarantName || "________________________________________________"}, ${
        data.declarantNationality || "brasileiro(a)"
    }${data.declarantCivilStatus ? `, ${data.declarantCivilStatus}` : ""}, portador(a) do RG nº ${
        data.declarantRg || "_____________________"
    } e do CPF nº ${data.declarantCpf || "_________________________"}. Declaro que o valor total presente na conta bancária nº ${
        data.accountNumber || "__________________"
    }, agência nº ${data.agencyNumber || "_____________"}${
        data.bankName ? `, do Banco ${data.bankName}` : ", do Banco ______________"
    } pertence à Congregação ${
        data.congregationName || "___________________________"
    } administrada pela Associação Bíblica e Cultural ${
        data.associationName || "_______________________________"
    } inscrita no CNPJ sob o nº ${
        data.associationCnpj || "____________________________"
    }, com sede no endereço ${
        data.associationAddress || "_____________________________________________________________________."
    }`;

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
                    <h1 className="text-center font-bold text-[15px] uppercase tracking-wide text-zinc-900 mb-8 pb-3 border-b border-zinc-200">
                        {data.documentTitle || "Declaração de Titularidade de Conta Bancária"}
                    </h1>

                    <div className="text-justify leading-relaxed whitespace-pre-wrap text-zinc-800 text-[14px]">
                        {textToRender}
                    </div>

                    {data.additionalNotes && (
                        <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 text-xs text-zinc-600 italic">
                            <strong>Observações:</strong> {data.additionalNotes}
                        </div>
                    )}

                    <div className="text-right text-[13px] text-zinc-700 mt-12 mb-16">
                        {locationDate || "Local e Data"}
                    </div>

                    <div className="flex flex-col items-center text-center mt-8">
                        <span className="font-bold text-[13px] text-zinc-900 mb-1.5 min-h-[20px]">
                            {data.declarantName || "Nome do Declarante"}
                        </span>
                        <div className="w-72 border-t border-zinc-900 mb-1.5" />
                        <span className="text-[11px] text-zinc-600">
                            {data.declarantCpf ? `CPF: ${data.declarantCpf}` : "Assinatura do Titular / Declarante"}
                        </span>
                    </div>
                </div>

                <div className="pt-6 mt-8 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{data.documentTitle}</span>
                    <span>Página 1 de 1</span>
                </div>
            </div>
        </div>
    );
}

