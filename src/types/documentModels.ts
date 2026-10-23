import { ISignaturePerson } from "./letterGenerator";

// 1. Declaração de Titularidade de Conta Bancária
export interface IBankAccountDeclarationData {
    // Declarador
    declarantName: string;
    declarantNationality: string;
    declarantCivilStatus: string;
    declarantRg: string;
    declarantCpf: string;

    // Conta Bancária
    bankName: string;
    agencyNumber: string;
    accountNumber: string;

    // Congregação e Associação
    congregationName: string;
    associationName: string; // Ex: Associação Bíblica e Cultural
    associationCnpj: string;
    associationAddress: string;

    // Local, Data e Observações
    city: string;
    state: string;
    date: string; // YYYY-MM-DD
    bodyText: string; // Texto editável da declaração
    additionalNotes?: string;

    documentTitle: string;
}

export const DEFAULT_BANK_ACCOUNT_DECLARATION: IBankAccountDeclarationData = {
    declarantName: "",
    declarantNationality: "brasileiro",
    declarantCivilStatus: "",
    declarantRg: "",
    declarantCpf: "",
    bankName: "",
    agencyNumber: "",
    accountNumber: "",
    congregationName: "",
    associationName: "Associação Bíblica e Cultural",
    associationCnpj: "",
    associationAddress: "",
    city: "",
    state: "",
    date: new Date().toISOString().split("T")[0],
    bodyText: "",
    additionalNotes: "",
    documentTitle: "Declaração de Titularidade de Conta Bancária",
};

// 2. Registro de Previsão de Gastos (Saldo Reserva)
export interface IExpenseForecastData {
    title: string;
    congregationName: string;
    congregationNumber: string;
    approvalDate: string; // YYYY-MM-DD
    maxReserveAmount: string; // Ex: 1.300,00
    bodyText: string;
    additionalNotes?: string;
    signatures: ISignaturePerson[];
    documentTitle: string;
}

export const DEFAULT_EXPENSE_FORECAST: IExpenseForecastData = {
    title: "Registro de previsão de gastos",
    congregationName: "",
    congregationNumber: "",
    approvalDate: new Date().toISOString().split("T")[0],
    maxReserveAmount: "1.300,00",
    bodyText: "",
    additionalNotes: "",
    signatures: [
        { name: "", role: "Coordenador" },
        { name: "", role: "Secretário" },
        { name: "", role: "Supte. Serviço" },
    ],
    documentTitle: "Registro de previsão de gastos",
};

// 3. Autorizados a Fazer Pagamentos
export interface IPaymentAuthorizedData {
    title: string;
    date: string; // YYYY-MM-DD
    congregationName: string;
    congregationState: string;
    authorizedBrothers: string[]; // Lista de nomes autorizados
    bodyText: string;
    additionalNotes?: string;
    signatures: ISignaturePerson[];
    documentTitle: string;
}

export const DEFAULT_PAYMENT_AUTHORIZED: IPaymentAuthorizedData = {
    title: "Autorizados a fazer pagamentos",
    date: new Date().toISOString().split("T")[0],
    congregationName: "",
    congregationState: "",
    authorizedBrothers: [""],
    bodyText: "Irmãos autorizados a fazer pagamentos usando a conta da congregação.",
    additionalNotes: "",
    signatures: [
        { name: "", role: "Coordenador" },
        { name: "", role: "Secretário" },
        { name: "", role: "Supte. Serviço" },
    ],
    documentTitle: "Autorizados a fazer pagamentos",
};

// 4. Resolução para Obra Mundial
export interface IWorldwideWorkResolutionData {
    title: string;
    congregationName: string;
    congregationState: string;
    congregationNumber: string;
    monthlyAmount: string; // Ex: 150,00
    serviceYear: string; // Ex: 2027
    approvalDate: string; // YYYY-MM-DD
    bodyText: string;
    additionalNotes?: string;
    signatures: ISignaturePerson[];
    documentTitle: string;
}

export const DEFAULT_WORLDWIDE_WORK_RESOLUTION: IWorldwideWorkResolutionData = {
    title: "Resolução para Obra Mundial",
    congregationName: "",
    congregationState: "",
    congregationNumber: "",
    monthlyAmount: "150,00",
    serviceYear: String(new Date().getFullYear() + 1),
    approvalDate: new Date().toISOString().split("T")[0],
    bodyText: "",
    additionalNotes: "",
    signatures: [
        { name: "", role: "Coordenador" },
        { name: "", role: "Secretário" },
        { name: "", role: "Supte. Serviço" },
    ],
    documentTitle: "Resolução para Obra Mundial",
};

// 5. Registro de Valor Pagamentos Aprovados pelo CCA
export interface ICcaPaymentsApprovalData {
    title: string;
    date: string; // YYYY-MM-DD
    congregationName: string;
    congregationState: string;
    congregationNumber: string;
    maxRoutineAmount: string; // Ex: 400,00
    approverRole: string; // Ex: Coordenador do corpo de anciãos
    bodyText: string;
    additionalNotes?: string;
    signatures: ISignaturePerson[];
    documentTitle: string;
}

export const DEFAULT_CCA_PAYMENTS_APPROVAL: ICcaPaymentsApprovalData = {
    title: "Registro de valor pagamentos aprovados pelo CCA",
    date: new Date().toISOString().split("T")[0],
    congregationName: "",
    congregationState: "",
    congregationNumber: "",
    maxRoutineAmount: "400,00",
    approverRole: "Coordenador do corpo de anciãos",
    bodyText: "",
    additionalNotes: "",
    signatures: [
        { name: "", role: "Coordenador" },
        { name: "", role: "Secretário" },
        { name: "", role: "Supte. Serviço" },
    ],
    documentTitle: "Registro de valor pagamentos aprovados pelo CCA",
};

// 6. Pauta da Reunião do Corpo de Anciãos
export interface IAgendaTopicItem {
    id: string;
    subject: string;
    reference: string;
    referenceText?: string;
    duration?: string;
    suggestedBy?: string;
    decision?: string; // Decisão tomada pelo corpo, detalhes de execução, responsável e prazo
}

export interface IAgendaRecommendationItem {
    id: string;
    name: string;
    decision: string;
    notes?: string;
    birthDate?: string;
    baptismDate?: string;
    yearsAsServant?: string;
}

export interface IAgendaRemovalItem {
    id: string;
    role: "elder" | "servant";
    name: string;
    reason: string;
}

export interface IEldersMeetingAgendaData {
    congregationName: string;
    locationAndDate: string;
    openingPrayer: string;
    closingPrayer: string;
    topics: IAgendaTopicItem[];
    elderRecommendations: IAgendaRecommendationItem[];
    servantRecommendations: IAgendaRecommendationItem[];
    removals: IAgendaRemovalItem[];
    footerNote: string;
    documentTitle: string;
    coordinatorName?: string;
    secretaryName?: string;
}

export const DEFAULT_AGENDA_FOOTER_NOTE =
    "Querido ancião, por favor, considere todos os assuntos com oração e com base em todas as referências bíblicas e teocráticas.\n(Pro. 11:14; Sal. 127:1)";

export const DEFAULT_ELDERS_MEETING_AGENDA: IEldersMeetingAgendaData = {
    congregationName: "",
    locationAndDate: "Salão do Reino",
    openingPrayer: "",
    closingPrayer: "",
    topics: [
        { id: "topic_1", subject: "", reference: "", referenceText: "", duration: "", suggestedBy: "" },
        { id: "topic_2", subject: "", reference: "", referenceText: "", duration: "", suggestedBy: "" },
        { id: "topic_3", subject: "", reference: "", referenceText: "", duration: "", suggestedBy: "" },
    ],
    elderRecommendations: [],
    servantRecommendations: [],
    removals: [],
    footerNote: DEFAULT_AGENDA_FOOTER_NOTE,
    documentTitle: "Pauta da Reunião do Corpo de Anciãos",
};

