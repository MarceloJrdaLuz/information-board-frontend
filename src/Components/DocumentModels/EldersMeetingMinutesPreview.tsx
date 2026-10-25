import React from "react";
import { IEldersMeetingAgendaData } from "@/types/documentModels";

interface Props {
    data: IEldersMeetingAgendaData;
}

export default function EldersMeetingMinutesPreview({ data }: Props) {
    const hasElderRecs = (data.elderRecommendations || []).length > 0;
    const hasServantRecs = (data.servantRecommendations || []).length > 0;
    const hasRemovals = (data.removals || []).length > 0;
    const hasAnyRecs = hasElderRecs || hasServantRecs || hasRemovals;

    const validTopics = (data.topics || []).filter(
        t => t.subject?.trim() || t.decision?.trim() || t.reference?.trim()
    );

    const topicsToRender = validTopics.length > 0 ? validTopics : (data.topics || []);

    return (
        <div className="w-full flex justify-center py-4 overflow-x-auto">
            <div
                className="bg-white text-slate-900 shadow-xl border border-slate-200/80 rounded-sm flex flex-col justify-between transition-all"
                style={{
                    width: "100%",
                    maxWidth: "780px",
                    minHeight: "1020px",
                    padding: "48px 52px 40px",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.5",
                }}
            >
                <div className="flex flex-col gap-5">
                    {/* Topo e Título Oficial da Ata */}
                    <div className="text-center border-b-2 border-[#1e3a5f] pb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1e3a5f] block mb-1">
                            Documento Confidencial do Corpo de Anciãos
                        </span>
                        <h1 className="text-[17px] font-black tracking-wide text-[#0f2942] uppercase m-0">
                            Ata da Reunião do Corpo de Anciãos
                        </h1>
                    </div>

                    {/* Grade 2x2 de Informações da Reunião */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 bg-slate-50/80 border border-slate-200 rounded-lg p-3.5 text-xs">
                        <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-bold text-[#1e3a5f] shrink-0">Congregação:</span>
                            <span className="font-semibold text-slate-800 border-b border-slate-300 flex-1 min-h-[20px] pb-0.5 truncate">
                                {data.congregationName || "\u00A0"}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-bold text-[#1e3a5f] shrink-0">Oração inicial:</span>
                            <span className="text-slate-800 border-b border-slate-300 flex-1 min-h-[20px] pb-0.5 truncate">
                                {data.openingPrayer || "\u00A0"}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-bold text-[#1e3a5f] shrink-0">Local / Data:</span>
                            <span className="text-slate-800 border-b border-slate-300 flex-1 min-h-[20px] pb-0.5 truncate">
                                {data.locationAndDate || "\u00A0"}
                            </span>
                        </div>

                        <div className="flex items-baseline gap-2 min-w-0">
                            <span className="font-bold text-[#1e3a5f] shrink-0">Oração final:</span>
                            <span className="text-slate-800 border-b border-slate-300 flex-1 min-h-[20px] pb-0.5 truncate">
                                {data.closingPrayer || "\u00A0"}
                            </span>
                        </div>
                    </div>

                    {/* Preâmbulo */}
                    <p className="text-xs text-slate-700 leading-relaxed text-justify mb-0">
                        O corpo de anciãos reuniu-se para orar e deliberar a respeito dos assuntos e necessidades da congregação. Abaixo estão formalmente registradas as resoluções, providências adotadas, designações e decisões tomadas:
                    </p>

                    {/* TABELA DE DELIBERAÇÕES E DECISÕES (ATA) */}
                    <div className="flex flex-col gap-2">
                        <div className="border-l-[3.5px] border-[#1e3a5f] pl-2.5 py-0.5">
                            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-[#0f2942] m-0">
                                Deliberações e Decisões Tomadas
                            </h2>
                        </div>

                        <table className="w-full border-collapse border border-slate-300 rounded-md overflow-hidden text-xs">
                            <thead>
                                <tr className="bg-[#1e3a5f] text-white">
                                    <th className="py-2 px-2.5 text-center font-bold text-[10.5px] uppercase tracking-wider w-[36px] border-r border-white/20">
                                        #
                                    </th>
                                    <th className="py-2 px-3 text-left font-bold text-[10.5px] uppercase tracking-wider w-[42%] border-r border-white/20">
                                        Assunto & Referência
                                    </th>
                                    <th className="py-2 px-3 text-left font-bold text-[10.5px] uppercase tracking-wider w-[58%]">
                                        Decisão Tomada, Responsável & Prazo
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topicsToRender.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                                            Nenhuma deliberação registrada nesta ata.
                                        </td>
                                    </tr>
                                ) : (
                                    topicsToRender.map((topic, idx) => {
                                        const isEven = idx % 2 === 1;

                                        return (
                                            <tr
                                                key={topic.id || idx}
                                                className={`border-b border-slate-200 ${isEven ? "bg-slate-50/70" : "bg-white"}`}
                                            >
                                                <td className="py-2.5 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-100/50">
                                                    {idx + 1}
                                                </td>

                                                {/* Assunto e Referência resumida (sem citação de parágrafo longo) */}
                                                <td className="py-2.5 px-3 border-r border-slate-200 align-top">
                                                    <div className="space-y-1">
                                                        <div className="font-bold uppercase text-slate-900 leading-snug">
                                                            {(topic.subject || "").toUpperCase()}
                                                        </div>
                                                        {topic.reference?.trim() && (
                                                            <div className="text-[11px] font-medium text-slate-600">
                                                                <span className="font-semibold text-slate-700">Ref:</span> {topic.reference}
                                                            </div>
                                                        )}
                                                        {topic.duration?.trim() && (
                                                            <span className="inline-block text-[9.5px] font-bold text-[#1e3a5f] bg-slate-200/80 border border-slate-300 rounded px-1.5 py-0.2">
                                                                {topic.duration.trim()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Decisão / Providências / Responsável e Prazo */}
                                                <td className="py-2.5 px-3 align-top">
                                                    {topic.decision?.trim() ? (
                                                        <div className="text-slate-900 whitespace-pre-wrap leading-relaxed text-[11.5px]">
                                                            {topic.decision}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">
                                                            (Decisão pendente ou não preenchida)
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* SEÇÃO 2: RECOMENDAÇÕES E REMOÇÕES APROVADAS (SE HOUVER) */}
                    {hasAnyRecs && (
                        <div className="flex flex-col gap-3 mt-1">
                            <div className="border-l-[3.5px] border-[#1e3a5f] pl-2.5 py-0.5">
                                <h2 className="text-[12.5px] font-black uppercase tracking-wider text-[#0f2942] m-0">
                                    Recomendações e Remoções Aprovadas
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Anciãos */}
                                {hasElderRecs && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#1e3a5f] bg-slate-100/90 border-b-2 border-[#1e3a5f] px-2 py-1 rounded-t">
                                            <span>Anciãos</span>
                                        </div>
                                        <table className="w-full border-collapse border border-slate-300 rounded overflow-hidden text-xs">
                                            <thead>
                                                <tr className="bg-slate-200 text-slate-800">
                                                    <th className="py-1.5 px-2 text-center font-bold text-[10px] uppercase w-[36px] border-r border-slate-300">#</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[54%] border-r border-slate-300">Nome</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[46%]">Decisão / Resolução</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.elderRecommendations.map((rec, idx) => (
                                                    <tr key={rec.id || idx} className="border-b border-slate-200">
                                                        <td className="py-1.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-50">{idx + 1}</td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top">
                                                            <div className="font-semibold text-slate-900">{rec.name}</div>
                                                            {rec.notes?.trim() && (
                                                                <div className="text-[10px] text-slate-500 italic mt-0.5">{rec.notes}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-1.5 px-3 align-top font-semibold text-slate-800">
                                                            {rec.decision || "Aprovado"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Servos */}
                                {hasServantRecs && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#1e3a5f] bg-slate-100/90 border-b-2 border-[#1e3a5f] px-2 py-1 rounded-t">
                                            <span>Servos Ministeriais</span>
                                        </div>
                                        <table className="w-full border-collapse border border-slate-300 rounded overflow-hidden text-xs">
                                            <thead>
                                                <tr className="bg-slate-200 text-slate-800">
                                                    <th className="py-1.5 px-2 text-center font-bold text-[10px] uppercase w-[36px] border-r border-slate-300">#</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[54%] border-r border-slate-300">Nome</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[46%]">Decisão / Resolução</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.servantRecommendations.map((rec, idx) => (
                                                    <tr key={rec.id || idx} className="border-b border-slate-200">
                                                        <td className="py-1.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-50">{idx + 1}</td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top">
                                                            <div className="font-semibold text-slate-900">{rec.name}</div>
                                                            {rec.notes?.trim() && (
                                                                <div className="text-[10px] text-slate-500 italic mt-0.5">{rec.notes}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-1.5 px-3 align-top font-semibold text-slate-800">
                                                            {rec.decision || "Aprovado"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Remoções */}
                                {hasRemovals && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#1e3a5f] bg-slate-100/90 border-b-2 border-[#1e3a5f] px-2 py-1 rounded-t">
                                            <span>Remoções ou Renúncias</span>
                                        </div>
                                        <table className="w-full border-collapse border border-slate-300 rounded overflow-hidden text-xs">
                                            <thead>
                                                <tr className="bg-slate-200 text-slate-800">
                                                    <th className="py-1.5 px-2 text-center font-bold text-[10px] uppercase w-[36px] border-r border-slate-300">#</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[24%] border-r border-slate-300">Privilégio</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[36%] border-r border-slate-300">Nome</th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[40%]">Motivo / Resolução</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.removals.map((rem, idx) => (
                                                    <tr key={rem.id || idx} className="border-b border-slate-200">
                                                        <td className="py-1.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-50">{idx + 1}</td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top font-semibold text-slate-800">
                                                            {rem.role === "servant" ? "Servo Ministerial" : "Ancião"}
                                                        </td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top font-medium text-slate-900">{rem.name}</td>
                                                        <td className="py-1.5 px-3 align-top text-slate-700">{rem.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bloco de Assinaturas da Ata */}
                <div className="pt-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end max-w-lg mx-auto">
                        <div className="flex flex-col items-center text-center">
                            <span className="font-bold text-[12px] text-slate-900 mb-1 min-h-[18px]">
                                {data.coordinatorName || "\u00A0"}
                            </span>
                            <div className="w-full border-t border-slate-800 mb-1" />
                            <span className="text-[11px] text-slate-600 font-medium">
                                Coordenador do Corpo de Anciãos
                            </span>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <span className="font-bold text-[12px] text-slate-900 mb-1 min-h-[18px]">
                                {data.secretaryName || "\u00A0"}
                            </span>
                            <div className="w-full border-t border-slate-800 mb-1" />
                            <span className="text-[11px] text-slate-600 font-medium">
                                Secretário da Congregação
                            </span>
                        </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Ata da Reunião do Corpo de Anciãos — Arquivo Confidencial</span>
                        <span>Página 1 de 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

