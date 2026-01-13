import CardTotals from "@/Components/CardTotals";
import PdfIcon from "@/Components/Icons/PdfIcon";
import S21 from "@/Components/PublisherCard";
import { IMonthsWithYear, IPublisher, IReports, ITotalsReports } from "@/types/types";
import { BlobProvider, Document } from "@react-pdf/renderer";

export function PdfLinkComponent({ pdfData }: { pdfData: { publishers?: IPublisher[], reportsFiltered?: IReports[], monthsServiceYears: IMonthsWithYear[], totals?: boolean, reportsTotalsFromFilter?: ITotalsReports[] } }) {
    const { publishers, reportsFiltered, monthsServiceYears, totals, reportsTotalsFromFilter } = pdfData;

    if (!publishers && !reportsTotalsFromFilter) return null;

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
                    download={publishers && publishers.length === 1 ? `${publishers[0].fullName}.pdf` : "Registros de publicadores.pdf"}
                    className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-surface-100 hover:text-red-600 transition-all duration-300 cursor-pointer  text-red-800"
                    title="Gerar PDF"
                >
                    <PdfIcon className="w-6 h-6" />
                </a>
            )}
        </BlobProvider>
    );
};
