import React from "react";
import { IEldersMeetingAgendaData } from "@/types/documentModels";

interface Props {
    data: IEldersMeetingAgendaData;
}

export default function EldersMeetingAgendaPreview({ data }: Props) {
    const hasElderRecs = (data.elderRecommendations || []).length > 0;
    const hasServantRecs = (data.servantRecommendations || []).length > 0;
    const hasRemovals = (data.removals || []).length > 0;
    const hasAnyRecs = hasElderRecs || hasServantRecs || hasRemovals;

    const validTopics = (data.topics || []).filter(
        t => t.subject?.trim() || t.reference?.trim() || t.referenceText?.trim()
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
                    {/* Topo e Título Principal */}
                    <div className="text-center border-b-2 border-[#1e3a5f] pb-3">
                        <h1 className="text-[17px] font-black tracking-wide text-[#0f2942] uppercase m-0">
                            Pauta da Reunião do Corpo de Anciãos
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

                    {/* SEÇÃO 1: ASSUNTOS E NECESSIDADES */}
                    <div className="flex flex-col gap-2">
                        <div className="border-l-[3.5px] border-[#1e3a5f] pl-2.5 py-0.5">
                            <h2 className="text-[12.5px] font-black uppercase tracking-wider text-[#0f2942] m-0">
                                Assuntos e necessidades da congregação
                            </h2>
                        </div>

                        <table className="w-full border-collapse border border-slate-300 rounded-md overflow-hidden text-xs">
                            <thead>
                                <tr className="bg-[#1e3a5f] text-white">
                                    <th className="py-2 px-2.5 text-center font-bold text-[10.5px] uppercase tracking-wider w-[36px] border-r border-white/20">
                                        #
                                    </th>
                                    <th className="py-2 px-3 text-left font-bold text-[10.5px] uppercase tracking-wider w-[56%] border-r border-white/20">
                                        Assunto
                                    </th>
                                    <th className="py-2 px-3 text-left font-bold text-[10.5px] uppercase tracking-wider w-[44%]">
                                        Referência
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topicsToRender.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                                            Nenhum assunto listado na pauta.
                                        </td>
                                    </tr>
                                ) : (
                                    topicsToRender.map((topic, idx) => {
                                        const hasExcerpt = Boolean(topic.referenceText && topic.referenceText.trim());
                                        const isEven = idx % 2 === 1;

                                        return (
                                            <React.Fragment key={topic.id || idx}>
                                                <tr className={`border-b border-slate-200 ${isEven ? "bg-slate-50/70" : "bg-white"}`}>
                                                    <td className="py-2 px-2.5 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-100/50">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="py-2 px-3 border-r border-slate-200 align-top">
                                                        <div className="space-y-1">
                                                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                                                                <span className="font-bold uppercase text-slate-900 leading-snug">
                                                                    {(topic.subject || "").toUpperCase()}
                                                                </span>
                                                                {topic.duration?.trim() && (
                                                                    <span className="text-[10px] font-extrabold text-[#1e3a5f] bg-slate-200 border border-slate-300 rounded px-1.5 py-0.5 whitespace-nowrap">
                                                                        {topic.duration.trim()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {topic.suggestedBy?.trim() && (
                                                                <div className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-300/80 rounded px-1.5 py-0.5">
                                                                    Indicado por: {topic.suggestedBy.trim()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3 align-top text-slate-700 whitespace-pre-wrap">
                                                        <div>{topic.reference}</div>
                                                        {topic.decision?.trim() && (
                                                            <div className="bg-emerald-50/80 border-l-[3px] border-emerald-600 border border-emerald-200 rounded-r-md p-2 text-[11px] text-slate-800 mt-2 leading-relaxed">
                                                                <div className="text-[9px] font-black uppercase text-emerald-800 tracking-wider mb-0.5">
                                                                    Decisão / Providências:
                                                                </div>
                                                                {topic.decision}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Linha com Parágrafo / Trecho da Referência Colado */}
                                                {hasExcerpt && (
                                                    <tr className={`border-b border-slate-200 ${isEven ? "bg-slate-50/70" : "bg-white"}`}>
                                                        <td className="border-r border-slate-200 bg-slate-100/30" />
                                                        <td colSpan={2} className="p-2.5">
                                                            <div className="bg-sky-50/70 border-l-[3px] border-[#1e3a5f] border border-slate-200 rounded-r-md p-2.5 text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                                                                <div className="text-[9.5px] font-black uppercase text-[#1e3a5f] tracking-wider mb-1">
                                                                    Trecho da Referência / Publicação:
                                                                </div>
                                                                {topic.referenceText}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* SEÇÃO 2: RECOMENDAÇÕES E REMOÇÕES */}
                    {hasAnyRecs && (
                        <div className="flex flex-col gap-3 mt-1">
                            <div className="border-l-[3.5px] border-[#1e3a5f] pl-2.5 py-0.5">
                                <h2 className="text-[12.5px] font-black uppercase tracking-wider text-[#0f2942] m-0">
                                    Recomendações e Remoções
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Sub-bloco: Anciãos */}
                                {hasElderRecs && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#1e3a5f] bg-slate-100/90 border-b-2 border-[#1e3a5f] px-2 py-1 rounded-t">
                                            <span>Anciãos</span>
                                            <span className="text-[10px] text-slate-500 font-semibold">
                                                {data.elderRecommendations.length}{" "}
                                                {data.elderRecommendations.length === 1 ? "indicação" : "indicações"}
                                            </span>
                                        </div>
                                        <table className="w-full border-collapse border border-slate-300 rounded overflow-hidden text-xs">
                                            <thead>
                                                <tr className="bg-slate-200 text-slate-800">
                                                    <th className="py-1.5 px-2 text-center font-bold text-[10px] uppercase w-[36px] border-r border-slate-300">
                                                        #
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[58%] border-r border-slate-300">
                                                        Nome
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[42%]">
                                                        Decisão
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.elderRecommendations.map((rec, idx) => (
                                                    <tr key={rec.id || idx} className="border-b border-slate-200">
                                                        <td className="py-1.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-50">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top">
                                                            <div className="font-semibold text-slate-900">{rec.name}</div>
                                                            {(rec.birthDate || rec.baptismDate || rec.yearsAsServant) && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                                                                    {rec.birthDate && <span><strong>Nasc:</strong> {rec.birthDate}</span>}
                                                                    {rec.baptismDate && <span><strong>Bat:</strong> {rec.baptismDate}</span>}
                                                                    {rec.yearsAsServant && <span><strong>Servo:</strong> {rec.yearsAsServant}</span>}
                                                                </div>
                                                            )}
                                                            {rec.notes?.trim() && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5 italic">
                                                                    {rec.notes}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-1.5 px-3 align-top text-slate-700">
                                                            {rec.decision}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Sub-bloco: Servos Ministeriais */}
                                {hasServantRecs && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#1e3a5f] bg-slate-100/90 border-b-2 border-[#1e3a5f] px-2 py-1 rounded-t">
                                            <span>Servos Ministeriais</span>
                                            <span className="text-[10px] text-slate-500 font-semibold">
                                                {data.servantRecommendations.length}{" "}
                                                {data.servantRecommendations.length === 1 ? "indicação" : "indicações"}
                                            </span>
                                        </div>
                                        <table className="w-full border-collapse border border-slate-300 rounded overflow-hidden text-xs">
                                            <thead>
                                                <tr className="bg-slate-200 text-slate-800">
                                                    <th className="py-1.5 px-2 text-center font-bold text-[10px] uppercase w-[36px] border-r border-slate-300">
                                                        #
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[58%] border-r border-slate-300">
                                                        Nome
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[42%]">
                                                        Decisão
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.servantRecommendations.map((rec, idx) => (
                                                    <tr key={rec.id || idx} className="border-b border-slate-200">
                                                        <td className="py-1.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-50">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top">
                                                            <div className="font-semibold text-slate-900">{rec.name}</div>
                                                            {(rec.birthDate || rec.baptismDate) && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                                                                    {rec.birthDate && <span><strong>Nasc:</strong> {rec.birthDate}</span>}
                                                                    {rec.baptismDate && <span><strong>Bat:</strong> {rec.baptismDate}</span>}
                                                                </div>
                                                            )}
                                                            {rec.notes?.trim() && (
                                                                <div className="text-[10px] text-slate-500 mt-0.5 italic">
                                                                    {rec.notes}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-1.5 px-3 align-top text-slate-700">
                                                            {rec.decision}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Sub-bloco: Remoções ou Renúncias */}
                                {hasRemovals && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-[#1e3a5f] bg-slate-100/90 border-b-2 border-[#1e3a5f] px-2 py-1 rounded-t">
                                            <span>Remoções ou Renúncias</span>
                                            <span className="text-[10px] text-slate-500 font-semibold">
                                                {data.removals.length}{" "}
                                                {data.removals.length === 1 ? "registro" : "registros"}
                                            </span>
                                        </div>
                                        <table className="w-full border-collapse border border-slate-300 rounded overflow-hidden text-xs">
                                            <thead>
                                                <tr className="bg-slate-200 text-slate-800">
                                                    <th className="py-1.5 px-2 text-center font-bold text-[10px] uppercase w-[36px] border-r border-slate-300">
                                                        #
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[24%] border-r border-slate-300">
                                                        Privilégio
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[36%] border-r border-slate-300">
                                                        Nome
                                                    </th>
                                                    <th className="py-1.5 px-3 text-left font-bold text-[10px] uppercase w-[40%]">
                                                        Motivo / Congregação
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.removals.map((rem, idx) => (
                                                    <tr key={rem.id || idx} className="border-b border-slate-200">
                                                        <td className="py-1.5 px-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top bg-slate-50">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top font-semibold text-slate-800">
                                                            {rem.role === "servant" ? "Servo Ministerial" : "Ancião"}
                                                        </td>
                                                        <td className="py-1.5 px-3 border-r border-slate-200 align-top font-medium text-slate-900">
                                                            {rem.name}
                                                        </td>
                                                        <td className="py-1.5 px-3 align-top text-slate-700">
                                                            {rem.reason}
                                                        </td>
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

                {/* Rodapé com Lembrete Bíblico */}
                {data.footerNote && (
                    <div className="pt-6 mt-6 border-t border-slate-200 text-center">
                        <p className="text-[11px] italic text-slate-600 leading-relaxed whitespace-pre-line m-0">
                            {data.footerNote}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

