import S88 from "@/Components/AssistanceCard";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import ListMeetingAssistance from "@/Components/ListMeetingAssistance";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAuthContext } from "@/context/AuthContext";
import { getYearService } from "@/functions/meses";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { IMeetingAssistance } from "@/types/types";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider, Document } from "@react-pdf/renderer";
import { useAtom } from "jotai";
import {
    FileDown,
    FilePlus2,
    FileText,
    Layers,
    Loader2,
    TrendingUp
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

function ListReportsPage() {
    const { roleContains } = useAuthContext();
    const router = useRouter();
    const { congregationId } = router.query;

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const [yearService] = useState(getYearService().toString());
    const [yearServiceSelected, setYearServiceSelected] = useState(
        getYearService().toString()
    );

    useEffect(() => {
        setPageActive("Assistência");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Assistência", link: `/congregacao/assistencia/${congregationId}` },
        ]);
    }, [setPageActive, setCrumbs, congregationId]);

    const { data, isLoading } = useAuthorizedFetch<IMeetingAssistance[]>(
        congregationId ? `/assistance/${congregationId}` : "",
        {
            allowedRoles: [
                "ADMIN_CONGREGATION",
                "ASSISTANCE_MANAGER",
                "ASSISTANCE_VIEWER",
            ],
        }
    );

    const meetingAssistance = useMemo(() => {
        if (!data) return [];
        const monthMap: Record<string, number> = {
            janeiro: 0,
            fevereiro: 1,
            março: 2,
            marco: 2,
            abril: 3,
            maio: 4,
            junho: 5,
            julho: 6,
            agosto: 7,
            setembro: 8,
            outubro: 9,
            novembro: 10,
            dezembro: 11,
        };
        return [...data].sort((a, b) => {
            const yearA = Number(a.year) || 0;
            const yearB = Number(b.year) || 0;
            if (yearB !== yearA) {
                return yearB - yearA;
            }
            const monthA = monthMap[a.month?.toLowerCase()] ?? (Number(a.month) || 0);
            const monthB = monthMap[b.month?.toLowerCase()] ?? (Number(b.month) || 0);
            return monthB - monthA;
        });
    }, [data]);

    // Estatísticas Médias do Ano de Serviço Selecionado
    const yearStats = useMemo(() => {
        if (!data || data.length === 0) {
            return { totalMidweek: 0, avgMidweek: 0, totalEndweek: 0, avgEndweek: 0, count: 0 };
        }
        // Filtra meses pertencentes ao ano de serviço selecionado
        // Ano de serviço vai de Setembro (ano - 1) a Agosto (ano)
        const yearInt = parseInt(yearServiceSelected, 10);
        const prevYear = yearInt - 1;

        const monthsInServiceYear = [
            { m: "setembro", y: prevYear },
            { m: "outubro", y: prevYear },
            { m: "novembro", y: prevYear },
            { m: "dezembro", y: prevYear },
            { m: "janeiro", y: yearInt },
            { m: "fevereiro", y: yearInt },
            { m: "março", y: yearInt },
            { m: "abril", y: yearInt },
            { m: "maio", y: yearInt },
            { m: "junho", y: yearInt },
            { m: "julho", y: yearInt },
            { m: "agosto", y: yearInt },
        ];

        const relevant = data.filter((item) =>
            monthsInServiceYear.some(
                (m) =>
                    m.m === item.month.toLowerCase() &&
                    m.y.toString() === item.year.toString()
            )
        );

        if (relevant.length === 0) {
            return { totalMidweek: 0, avgMidweek: 0, totalEndweek: 0, avgEndweek: 0, count: 0 };
        }

        const totalMidweek = relevant.reduce((acc, curr) => acc + (curr.midWeekTotal || 0), 0);
        const totalEndweek = relevant.reduce((acc, curr) => acc + (curr.endWeekTotal || 0), 0);
        const sumAvgMid = relevant.reduce((acc, curr) => acc + (curr.midWeekAverage || 0), 0);
        const sumAvgEnd = relevant.reduce((acc, curr) => acc + (curr.endWeekAverage || 0), 0);

        return {
            totalMidweek,
            totalEndweek,
            avgMidweek: Math.round(sumAvgMid / relevant.length),
            avgEndweek: Math.round(sumAvgEnd / relevant.length),
            count: relevant.length,
        };
    }, [data, yearServiceSelected]);

    const yearOptions = [
        yearService,
        (Number(yearService) - 1).toString(),
        (Number(yearService) - 2).toString(),
        (Number(yearService) - 3).toString(),
    ];

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Assistência"} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 ">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Assistência às Reuniões
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Registro e acompanhamento mensal da assistência e formulário S-88.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ações e Seletor de Ano */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Seletor de Ano de Serviço */}
                        <div className="flex items-center gap-2 bg-surface-100 px-3 py-2 rounded-xl border border-surface-300 text-xs font-semibold text-typography-700">
                            <span>Ano de Serviço:</span>
                            <select
                                value={yearServiceSelected}
                                onChange={(e) => setYearServiceSelected(e.target.value)}
                                className="bg-transparent font-bold text-primary-200 focus:outline-none cursor-pointer"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y} className="bg-surface-100 text-typography-800">
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(roleContains("ASSISTANCE_MANAGER") ||
                            roleContains("ADMIN_CONGREGATION")) && (
                            <Button
                                onClick={() => {
                                    router.push(
                                        `/congregacao/assistencia/${congregationId}/enviar`
                                    );
                                }}
                                className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm"
                            >
                                <FilePlus2 className="w-4 h-4" />
                                <span>Registrar Assistência</span>
                            </Button>
                        )}

                        {data && data.length > 0 && (
                            <BlobProvider
                                document={
                                    <Document>
                                        <S88
                                            meetingAssistance={data}
                                            yearsServices={[
                                                yearServiceSelected,
                                                (Number(yearServiceSelected) - 1).toString(),
                                            ]}
                                        />
                                    </Document>
                                }
                            >
                                {({ blob, url, loading, error }) => (
                                    <a
                                        href={url ?? "#"}
                                        download={`Assistencia_S88_${yearServiceSelected}.pdf`}
                                        className={loading || !!error || !blob ? "pointer-events-none opacity-50" : ""}
                                    >
                                        <Button
                                            variant="outline"
                                            className="gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl"
                                            disabled={loading || !!error || !blob}
                                        >
                                            <FileDown className="w-4 h-4" />
                                            <span>{loading ? "Gerando..." : "Salvar S-88 (PDF)"}</span>
                                        </Button>
                                    </a>
                                )}
                            </BlobProvider>
                        )}
                    </div>
                </div>

                {/* Métricas do Ano de Serviço Selecionado */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200 ">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-typography-500">
                                Média Meio de Semana
                            </span>
                            <div className="text-lg font-bold text-typography-800">
                                {yearStats.avgMidweek}{" "}
                                <span className="text-xs font-normal text-typography-400">presentes</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-typography-500">
                                Média Fim de Semana
                            </span>
                            <div className="text-lg font-bold text-typography-800">
                                {yearStats.avgEndweek}{" "}
                                <span className="text-xs font-normal text-typography-400">presentes</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-surface-100 text-typography-600">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-typography-500">
                                Meses Registrados
                            </span>
                            <div className="text-lg font-bold text-typography-800">
                                {yearStats.count} / 12{" "}
                                <span className="text-xs font-normal text-typography-400">meses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Meses */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500">
                            Carregando histórico de assistência...
                        </p>
                    </div>
                ) : (
                    <ListMeetingAssistance
                        yearService={yearServiceSelected}
                        items={meetingAssistance}
                    />
                )}
            </div>
        </ContentDashboard>
    );
}

ListReportsPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "ASSISTANCE_MANAGER",
    "ASSISTANCE_VIEWER",
]);

export default ListReportsPage;
