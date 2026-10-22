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

