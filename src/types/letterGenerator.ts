export interface ISignaturePerson {
    name: string;
    role: string;
}

export interface ILetterContentSection {
    id: string;
    type: "paragraph" | "heading";
    text: string;
}

export interface ILetterData {
    // Cabeçalho da congregação remetente
    congregationName: string;
    congregationNumber: string;
    congregationAddress: string;
    congregationCity: string;
    congregationState: string;
    congregationZipCode: string;

    // Data e Destinatário
    date: string; // YYYY-MM-DD
    destinationCongregation: string;
    destinationAttention: string; // A/C
    subject: string;
    salutation: string; // Prezados irmãos,

    // Conteúdo da carta
    bodyRaw: string; // Texto colado ou digitado

    // Conclusão e Assinaturas
    signOffPhrase: string; // Desejamos que as ricas bênçãos...
    closing: string; // Seus irmãos,
    signatures: ISignaturePerson[];
    additionalFooterNote: string; // Corpo de anciãos da Congregação...

    // Configurações do Documento
    documentTitle: string; // Carta de apresentação (exibido no rodapé)
}

export const DEFAULT_LETTER_DATA: ILetterData = {
    congregationName: "",
    congregationNumber: "",
    congregationAddress: "",
    congregationCity: "",
    congregationState: "",
    congregationZipCode: "",
    date: new Date().toISOString().split("T")[0],
    destinationCongregation: "",
    destinationAttention: "Corpo de Anciãos",
    subject: "Envio de cartões e carta de apresentação",
    salutation: "Prezados irmãos,",
    bodyRaw: "",
    signOffPhrase: "Desejamos que as ricas bênçãos de Jeová estejam sempre sobre os irmãos.",
    closing: "Seus irmãos,",
    signatures: [
        { name: "", role: "Coordenador" },
        { name: "", role: "Secretário" },
        { name: "", role: "Superintendente de Serviço" },
    ],
    additionalFooterNote: "",
    documentTitle: "Carta de apresentação",
};

