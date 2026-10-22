import React from "react";
import { ILetterData } from "@/types/letterGenerator";
import { formatLongDate, parseLetterBody } from "@/utils/letterParser";

interface Props {
    data: ILetterData;
}

export default function LetterLivePreview({ data }: Props) {
    const formattedDate = formatLongDate(data.date);
    const sections = parseLetterBody(data.bodyRaw);

    const addressParts = [
        data.congregationAddress,
        data.congregationCity && data.congregationState
            ? `${data.congregationCity} – ${data.congregationState}`
            : data.congregationCity,
        data.congregationZipCode ? `CEP ${data.congregationZipCode}` : "",
    ].filter(Boolean);
    const fullAddress = addressParts.join(" · ");

    const validSignatures = (data.signatures || []).filter(
        s => s.name?.trim() || s.role?.trim()
    );

    return (
        <div className="w-full flex justify-center py-4 overflow-x-auto">
            {/* Folha A4 Virtual */}
            <div
                className="bg-white text-zinc-900 shadow-xl border border-zinc-200/80 rounded-sm flex flex-col justify-between transition-all"
                style={{
                    width: "100%",
                    maxWidth: "760px",
                    minHeight: "980px",
                    padding: "48px 56px",
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: "13.5px",
                    lineHeight: "1.55",
                }}
            >
                <div>
                    {/* 1. Cabeçalho da Congregação */}
                    <div className="mb-2">
                        <h2 className="text-right font-bold text-[14px] uppercase tracking-wide text-zinc-900">
                            CONGREGAÇÃO {data.congregationName || "NOME DA CONGREGAÇÃO"}{" "}
                            {data.congregationNumber ? `(${data.congregationNumber})` : ""}
                        </h2>
                        {fullAddress ? (
                            <p className="text-right text-[11px] text-zinc-500 mt-0.5">
                                {fullAddress}
                            </p>
                        ) : (
                            <p className="text-right text-[11px] text-zinc-400 italic mt-0.5">
                                Endereço da congregação
                            </p>
                        )}
                        <hr className="border-t border-zinc-300 mt-2.5 mb-4" />
                    </div>

                    {/* 2. Data */}
                    <div className="text-right text-[12.5px] text-zinc-700 mb-5">
                        {formattedDate || "Data da carta"}
                    </div>

                    {/* 3. Destinatário */}
                    <div className="mb-4 text-[13px] leading-relaxed">
                        <p className="text-zinc-900 font-medium">
                            {data.destinationCongregation || (
                                <span className="text-zinc-400 italic">
                                    À Congregação [Destino] – UF (número)
                                </span>
                            )}
                        </p>
                        {data.destinationAttention && (
                            <p className="text-zinc-700">A/C: {data.destinationAttention}</p>
                        )}
                        <p className="font-bold text-zinc-900 mt-2">
                            Assunto: {data.subject || "Envio de cartões e carta de apresentação"}
                        </p>
                    </div>

                    {/* 4. Saudação */}
                    <div className="mb-3 text-[13px] text-zinc-800 font-medium">
                        {data.salutation || "Prezados irmãos,"}
                    </div>

                    {/* 5. Corpo da Carta */}
                    <div className="space-y-3.5 text-justify text-[13px] leading-relaxed text-zinc-800">
                        {sections.length === 0 ? (
                            <div className="py-12 border-2 border-dashed border-zinc-200 rounded-xl text-center text-zinc-400 text-xs">
                                O texto digitado ou colado aparecerá aqui formatado em tempo real.
                            </div>
                        ) : (
                            sections.map((sec) => {
                                if (sec.type === "heading") {
                                    return (
                                        <h3
                                            key={sec.id}
                                            className="font-bold text-[13.5px] text-zinc-900 pt-2 pb-0.5"
                                        >
                                            {sec.text}
                                        </h3>
                                    );
                                }
                                return (
                                    <p key={sec.id} className="text-justify leading-relaxed">
                                        {sec.text}
                                    </p>
                                );
                            })
                        )}
                    </div>

                    {/* 6. Conclusão e Despedida */}
                    {data.signOffPhrase && (
                        <p className="mt-4 text-justify text-[13px] leading-relaxed text-zinc-800">
                            {data.signOffPhrase}
                        </p>
                    )}

                    {data.closing && (
                        <p className="mt-3 text-[13px] text-zinc-800 font-medium mb-10">
                            {data.closing}
                        </p>
                    )}

                    {/* 7. Bloco de Assinaturas */}
                    {validSignatures.length > 0 && (
                        <div className="mt-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                                {validSignatures.map((sig, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center">
                                        <div className="w-full border-t border-zinc-900 mb-1.5" />
                                        <span className="font-bold text-[11px] text-zinc-900">
                                            {sig.name || "Nome do irmão"}
                                        </span>
                                        {sig.role && (
                                            <span className="text-[10px] text-zinc-600">
                                                {sig.role}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {data.additionalFooterNote && (
                                <p className="text-center text-[11.5px] text-zinc-600 mt-6 font-medium">
                                    {data.additionalFooterNote}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* 8. Rodapé da Folha */}
                <div className="pt-8 mt-12 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>{data.documentTitle || "Carta de apresentação"}</span>
                    <span>Página 1</span>
                </div>
            </div>
        </div>
    );
}

