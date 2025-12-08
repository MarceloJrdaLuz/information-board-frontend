import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { generateCleaningScheduleAtom } from "@/atoms/cleaningScheduleAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import Button from "@/Components/Button";
import Calendar from "@/Components/Calendar";
import { CleaningExceptionsCard } from "@/Components/CleaningExceptionCard";
import CleaningScheduleConfigCard from "@/Components/CleaningScheduleConfigCard";
import CleaningSchedulePageSkeleton from "@/Components/CleaningSchedulePageSkeleton";
import CleaningSchedulePdf from "@/Components/CleaningSchedulePdf";
import CleaningScheduleTable from "@/Components/CleaningScheduleTable";
import ContentDashboard from "@/Components/ContentDashboard";
import PdfIcon from "@/Components/Icons/PdfIcon";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { ICleaningScheduleResponse } from "@/types/cleaning";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider, Document } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


interface PdfLinkComponentProps {
    schedule: ICleaningScheduleResponse
    congregationName?: string
}

function PdfLinkComponent({ schedule, congregationName }: PdfLinkComponentProps) {
    if (!schedule || !schedule.schedules || schedule.schedules.length === 0) {
        return null;
    }
    return (
        <BlobProvider
            document={<Document>
                <CleaningSchedulePdf
                    schedule={schedule}
                    congregationName={congregationName}
                />
            </Document>}
        >
            {({ blob, url, loading, error }) => {
                const isDisabled = loading || !!error || !blob;

                return (
                    <a
                        href={url || "#"}
                        download={url ? `Programação da limpeza.pdf` : undefined}
                        className={isDisabled ? "pointer-events-none" : ""}
                    >
                        <Button
                            outline
                            className="bg-surface-100 w-56 text-primary-200 p-1 md:p-3 border-typography-300 rounded-none hover:opacity-80"
                            disabled={isDisabled}
                        >
                            <PdfIcon />
                            <span className="text-primary-200 font-semibold">
                                {loading ? "Gerando PDF..." : "Gerar PDF"}
                            </span>
                        </Button>
                    </a>
                );
            }}
        </BlobProvider>
    );
}

function CleaningSchedulePage() {
    const { congregation } = useCongregationContext();
    const [crumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const generateCleaningSchedule = useSetAtom(generateCleaningScheduleAtom)

    const [startDate, setStartDate] = useState<string | null>(dayjs().startOf("month").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState<string | null>(dayjs().endOf("month").format("YYYY-MM-DD"));
    const [schedule, setSchedule] = useState<ICleaningScheduleResponse>();
    const [loading, setLoading] = useState(false);



    const urlSchedulesConfig = congregation
        ? `${API_ROUTES.CLEANING_SCHEDULES}/congregation/${congregation.id}`
        : "";
    const { data, mutate } = useAuthorizedFetch<ICleaningScheduleResponse>(urlSchedulesConfig, {
        allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
    });

    useEffect(() => {
        if (data) {
            setSchedule(data)
            if (data?.schedules && data.schedules.length > 0) {
                // Ordena as datas das programações existentes
                const sortedDates = data.schedules
                    .map(s => s.date) // assumindo que cada schedule tem um campo "date"
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                // Pega a última data e adiciona 1 dia
                const lastDate = dayjs(sortedDates[sortedDates.length - 1]).add(1, 'day').format('YYYY-MM-DD');
                setStartDate(lastDate);

                // Mantemos o endDate como o final do mês da nova startDate, se quiser
                setEndDate(dayjs(lastDate).endOf('month').format('YYYY-MM-DD'));
            } else {
                // Se não houver programações, usa padrão
                setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
                setEndDate(dayjs().endOf('month').format('YYYY-MM-DD'));
            }
        }
    }, [data])

    useEffect(() => {
        setPageActive("Programação de Limpeza");
    }, []);




    const handleGenerateSchedule = async () => {
        if (!congregation || !startDate || !endDate) return;
        setLoading(true);
        await toast.promise(
            generateCleaningSchedule(congregation.id, {
                start: startDate,
                end: endDate
            }),
            {
                pending: 'Gerando programação de limpeza...'
            }).then(() => {
                mutate()
            }).catch(err => {
                console.log(err)
            })
        setLoading(false);
    };

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Programação de Limpeza"} />
            {!data ? (
                <CleaningSchedulePageSkeleton />
            ) : (
                <>
                    <div className="flex justify-around flex-wrap">
                        <CleaningScheduleConfigCard />
                        <CleaningExceptionsCard />

                        <div className="flex flex-col w-full max-w-[400px] m-4 p-5 gap-4 bg-surface-100 rounded-md shadow">
                            <h3 className="font-semibold mb-2 text-typography-700">Gerar programação da limpeza</h3>
                            <Calendar
                                label="Data inicial"
                                titleHidden
                                full
                                handleDateChange={setStartDate}
                                selectedDate={startDate}
                            />
                            <Calendar
                                label="Data final"
                                titleHidden
                                full
                                handleDateChange={setEndDate}
                                selectedDate={endDate}
                            />
                            <Button className="w-full text-typography-200" onClick={handleGenerateSchedule} disabled={loading}>
                                {loading ? "Gerando..." : "Gerar Programação"}
                            </Button>
                            {schedule && schedule?.schedules && schedule.schedules.length > 0 && (
                                <PdfLinkComponent
                                    schedule={schedule}
                                    congregationName={congregation?.name}
                                />
                            )}
                        </div>

                    </div >
                    <div className="m-4">
                        {schedule?.schedules && schedule.schedules.length > 0 && (
                            <>

                                <CleaningScheduleTable schedule={schedule} />
                            </>
                        )}
                    </div>
                </>
            )
            }
        </ContentDashboard >
    );
}

CleaningSchedulePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "CLEANING_MANAGER"]);

export default CleaningSchedulePage;
