export interface IVercelUsageDailyItem {
    date: string;   // "2025-11-01"
    total: number;  // soma dos sucessos + erros
}

export interface IVercelUsageBreakdown {
    name: string;       // nome do projeto
    percent: string;    // percentual de uso
}

export interface IVercelUsageResponse {
    total_invocations: number;
    percent_used: string;
    limit: number;
    breakdown: IVercelUsageBreakdown[];
    daily: IVercelUsageDailyItem[];
}
