import CardTotals from "@/Components/CardTotals";
import PdfIcon from "@/Components/Icons/PdfIcon";
import S21 from "@/Components/PublisherCard";
import { IMonthsWithYear, IPublisher, IReports, ITotalsReports } from "@/types/types";
import { BlobProvider, Document } from "@react-pdf/renderer";
import React from "react";

export function PdfLinkComponent({
    pdfData,
    className,
    children
}: {
    pdfData: {
        publishers?: IPublisher[],
        reportsFiltered?: IReports[],
        monthsServiceYears: IMonthsWithYear[],
        totals?: boolean,
        reportsTotalsFromFilter?: ITotalsReports[],
        totalsFrom?: string,
        serviceYear?: string | number
    },
    className?: string,
    children?: React.ReactNode
}) {
    const { publishers, reportsFiltered, monthsServiceYears, totals, reportsTotalsFromFilter, totalsFrom, serviceYear } = pdfData;

    if (!publishers && !reportsTotalsFromFilter) return null;

    const getDownloadFileName = () => {
        if (totals) {
            const category = totalsFrom ? ` - ${totalsFrom}` : "";
            const year = serviceYear ? ` - Ano ${serviceYear}` : "";
            return `Totais${category}${year}.pdf`;
        }

        if (publishers && publishers.length === 1) {
            return `${publishers[0].fullName}.pdf`;
        }

        const year = serviceYear ? ` - Ano ${serviceYear}` : "";
        return `Registros de publicadores${year}.pdf`;
    };

    return (
        <BlobProvider
            document={
                <Document>
                    {!totals && publishers && publishers.length > 0
                        ? publishers.map((publisher, index) => {
                            const reports = reportsFiltered?.filter(r => r.publisher.id === publisher.id) || [];
                            return <S21 key={index} publisher={publisher} reports={reports} monthsWithYear={monthsServiceYears} />;
                        })
                        : reportsTotalsFromFilter && <CardTotals months={monthsServiceYears} reports={reportsTotalsFromFilter} />}
                </Document>
            }
        >
            {({ url, loading }) => (
                <a
                    href={url ?? "#"}
                    download={getDownloadFileName()}
                    className={className || "flex items-center justify-center w-8 h-8 p-2 rounded-full bg-surface-100 hover:text-red-600 transition-all duration-300 cursor-pointer text-red-800"}
                    title={totals ? "Gerar PDF de Totais" : "Gerar PDF S-21"}
                >
                    {children ? (
                        loading ? <span>Gerando PDF...</span> : children
                    ) : (
                        <PdfIcon className="w-6 h-6" />
                    )}
                </a>
            )}
        </BlobProvider>
    );
}

