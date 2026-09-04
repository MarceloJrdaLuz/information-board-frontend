import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import TerritoryIcon from "@/Components/Icons/TerritoryIcon";
import S13 from "@/Components/S13";
import TerritoriesList from "@/Components/TerritoriesList";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAuthContext } from "@/context/AuthContext";
import { useTerritoryContext } from "@/context/TerritoryContext";
import TerritoriesProviderLayout from "@/layouts/providers/territories/_layout";
import { ITerritoryWithHistories } from "@/types/territory";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider, Document } from "@react-pdf/renderer";
import { useAtom } from "jotai";
import { FileDown, Loader2, Plus } from "lucide-react";
import Router from "next/router";
import { ReactElement, useEffect, useState } from "react";

function TerritoriesPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const { territoriesHistory } = useTerritoryContext();
    const { roleContains } = useAuthContext();
    const [territoriesHistoryFilter, setTerritoriesHistoryFilter] = useState<
        ITerritoryWithHistories[]
    >([]);

    const canManage =
        roleContains("ADMIN_CONGREGATION") || roleContains("TERRITORIES_MANAGER");

    useEffect(() => {
        setPdfGenerating(true);
        setPageActive("Territórios");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Territórios", link: "/congregacao/territorios" },
        ]);
    }, [setPageActive, setCrumbs]);

    useEffect(() => {
        if (territoriesHistory) {
            const groupedTerritories = territoriesHistory.reduce((acc, history) => {
                const { territory, ...historyData } = history;

                if (!acc[territory.id]) {
                    acc[territory.id] = {
                        ...territory,
                        histories: [],
                        last_completion_date: null,
                    };
                }

                acc[territory.id].histories.push(historyData);

                return acc;
            }, {} as Record<string, ITerritoryWithHistories>);

            // Convertendo para array, ordenando os históricos e pegando a última conclusão
            const territoriesArray: ITerritoryWithHistories[] = Object.values(
                groupedTerritories
            ).map((territory) => {
                // Ordenar históricos pela completion_date mais recente
                const sortedHistories = territory.histories
                    .sort(
                        (a, b) =>
                            (b.completion_date ? new Date(b.completion_date).getTime() : 0) -
                            (a.completion_date ? new Date(a.completion_date).getTime() : 0)
                    )
                    .slice(0, 4); // Pega no máximo 4 históricos

                // Determinar a última data de conclusão
                const lastCompletionDate =
                    sortedHistories.find((h) => h.completion_date)?.completion_date || null;

                return {
                    ...territory,
                    histories: sortedHistories, // Apenas os 4 mais recentes
                    last_completion_date: lastCompletionDate,
                };
            });

            territoriesArray.sort((a, b) => a.number - b.number);

            setTerritoriesHistoryFilter(territoriesArray);
        }
    }, [territoriesHistory]);

    const PdfLinkComponent = () => (
        <BlobProvider
            document={
                <Document>
                    <S13 territoriesHistory={territoriesHistoryFilter ?? []} />
                </Document>
            }
        >
            {({ blob, url, loading }) => (
                <a
                    href={url ?? "#"}
                    download="S-13.pdf"
                    className={loading ? "pointer-events-none opacity-60" : ""}
                >
                    <Button
                        variant="outline"
                        type="button"
                        className="gap-2 rounded-xl border-surface-300 text-typography-700 hover:text-primary-200 hover:bg-surface-200 font-semibold text-xs h-10 px-4 shadow-xs transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-primary-200" />
                                <span>Gerando S-13...</span>
                            </>
                        ) : (
                            <>
                                <FileDown className="w-4 h-4 text-primary-200" />
                                <span>Salvar S-13 (PDF)</span>
                            </>
                        )}
                    </Button>
                </a>
            )}
        </BlobProvider>
    );

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Territórios" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200">
                                <TerritoryIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-typography-800">
                                    Territórios
                                </h1>
                                <p className="text-sm text-typography-500">
                                    Gestão dos mapas e registros de designação de territórios (S-13).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {pdfGenerating && <PdfLinkComponent />}

                        {canManage && (
                            <Button
                                onClick={() => Router.push("/congregacao/territorios/add")}
                                className="bg-primary-200 hover:bg-primary-300 text-white rounded-xl gap-2 font-semibold shadow-sm h-10 px-4"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Novo Território</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Lista de Territórios */}
                <TerritoriesList />
            </div>
        </ContentDashboard>
    );
}

TerritoriesPage.getLayout = (page: ReactElement) =>
    withProtectedLayout([
        "ADMIN_CONGREGATION",
        "TERRITORIES_MANAGER",
        "TERRITORIES_VIEWER",
    ])(<TerritoriesProviderLayout>{page}</TerritoriesProviderLayout>);

export default TerritoriesPage;
