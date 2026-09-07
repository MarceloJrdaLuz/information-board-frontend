export type TimelineSectionType = 'HEADER' | 'TREASURES' | 'MINISTRY' | 'LIVING' | 'CONCLUSION';

export interface ITimelineItem {
    id: string;
    title: string;
    section: TimelineSectionType;
    sectionTitle: string;
    sectionColor: string;
    durationMinutes: number;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    assignedRoleLabel?: string | null;
    assignedName?: string | null;
    assistantName?: string | null;
    readerName?: string | null;
    auxAssignedName?: string | null;
    auxAssistantName?: string | null;
    auxReaderName?: string | null;
    theme?: string | null;
    songNumber?: number | null;
    sourceMaterial?: string | null;
    lessonInfo?: string | null;
    isChairmanComment?: boolean;
    isStudentPart?: boolean;
    isSong?: boolean;
    partType?: string;
    room?: string;
}

export interface ITimerState {
    elapsedSeconds: number;
    isRunning: boolean;
    startedAtTimestamp: number | null;
    isCompleted: boolean;
}

export type TimersMap = Record<string, ITimerState>;

export interface IChairmanMeetingState {
    meetingStartTime: string;
    timers: TimersMap;
    updatedAt: number;
}

