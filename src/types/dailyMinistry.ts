export interface IPublisherBibleStudent {
    id: string;
    publisher_id: string;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface IPublisherFieldActivity {
    id: string;
    publisher_id: string;
    date: string; // YYYY-MM-DD
    minutes: number;
    credit_minutes: number;
    credit_description?: string | null;
    notes?: string | null;
    bible_student_id?: string | null;
    bible_student_ids?: string[] | null;
    bibleStudent?: IPublisherBibleStudent | null;
    bibleStudents?: IPublisherBibleStudent[] | null;
    created_at: string;
    updated_at: string;
}

export interface IPublisherMonthBalance {
    id: string;
    publisher_id: string;
    month: string;
    year: string;
    transferred_minutes_in: number;
    transferred_minutes_out: number;
    is_closed: boolean;
    created_at: string;
    updated_at: string;
}

export interface IDailyMinistrySummary {
    transferredMinutesIn: number;
    totalMinistryMinutes: number;
    totalCreditMinutes: number;
    totalMinutesOverall: number;
    totalStudiesCount: number;
}

export interface IDailyMinistryMonthData {
    year: string;
    month: string;
    activities: IPublisherFieldActivity[];
    balance: IPublisherMonthBalance;
    studentsWithStudies?: Array<{ id: string; name: string }>;
    summary: IDailyMinistrySummary;
    isLocked?: boolean;
    isClosedBySecretary?: boolean;
    isExpired?: boolean;
    isClosed?: boolean;
    isMyReportSubmitted?: boolean;
    submittedReport?: {
        id?: string;
        hours: number;
        studies?: number;
        observations?: string;
    } | null;
    lockReason?: "closed_by_secretary" | "closed" | "expired" | null;
    deadlineDate?: string;
}

