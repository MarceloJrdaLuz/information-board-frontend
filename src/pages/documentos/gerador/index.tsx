import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import ContentDashboard from "@/Components/ContentDashboard";
import LetterLivePreview from "@/Components/LetterGenerator/LetterLivePreview";
import LetterPdfDocument from "@/Components/LetterGenerator/LetterPdfDocument";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useCongregationContext } from "@/context/CongregationContext";
import { DEFAULT_LETTER_DATA, ILetterData } from "@/types/letterGenerator";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import {
    AlertCircle,
    Building2,
    Check,
    Copy,
    Download,
    ExternalLink,
    Eye,
    FileEdit,
    FileSignature,
    FileText,
    HelpCircle,
    Info,
    Lock,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
    Users
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const SAMPLE_PRESENTATION_TEXT = `Estamos enviando, em anexo, os cartões de publicador do irmão Fulano e Sobrenome e da irmã Fulana e Sobrenome, que estão se mudando para a sua congregação. Aproveitamos a oportunidade para compartilhar algumas informações sobre o casal, a fim de contribuir para a continuidade da assistência espiritual que lhes será oferecida.

O irmão Fulano cuidava das contas da congregação de maneira muito organizada e também já cuidou do arranjo de oradores. Ele tem boa oratória e, devido às necessidades da congregação, era utilizado em diversas designações na reunião do meio de semana, incluindo a presidência e a condução do estudo bíblico.

A irmã Fulana também era utilizada para apresentar partes de estudante na reunião do meio de semana.

### Histórico e aspectos que merecem atenção

O casal Sobrenome enfrenta dificuldades emocionais que, ao que temos observado, afetam diferentes aspectos de sua vida e de sua participação nas atividades da congregação. Na carta de apresentação enviada pela congregação anterior em que serviram, o corpo de anciãos já havia mencionado dificuldades semelhantes.

Recentemente, ao conversarmos com o irmão sobre a possibilidade de que ele estivesse enfrentando problemas emocionais, ele reconheceu que isso poderia ser o caso. Entretanto, informou que nunca procurou ajuda médica. Até onde sabemos, atualmente, nenhum dos dois está recebendo acompanhamento especializado.

Essas dificuldades parecem contribuir para que tenham problemas em manter amizades e em desenvolver um relacionamento mais próximo com outros irmãos. Em algumas ocasiões, tendem a se fechar e a se isolar consideravelmente da congregação.

Em relação ao irmão Fulano, observamos que ele apresenta uma personalidade bastante rígida e inflexível. Ao longo do tempo, demos a ele diversos conselhos sobre a importância de ser mais flexível e de estar disposto a ceder quando as circunstâncias não ocorrem conforme o que havia planejado ou esperado.

Um exemplo disso ocorreu durante um congresso em que ele estava designado para a equipe de áudio e vídeo. Na ocasião, o superintendente de áudio informou aos envolvidos que somente irmãos que tivessem preenchido a A-2 poderiam participar. O irmão comunicou que não participaria da montagem, pois não tinha planos de preencher esse formulário. Posteriormente, o superintendente de áudio entrou em contato conosco para nos informar sobre a situação.

Conversamos com o irmão e procuramos raciocinar com ele, pois entendíamos que talvez não estivesse compreendendo plenamente o objetivo da A-2. Também destacamos a importância de que ele, como servo ministerial, estivesse disposto a preencher o formulário. Apesar disso, ele decidiu que não o faria e, até o momento, continua sem preenchê-lo.

Situações semelhantes, nas quais demonstrava dificuldade em aceitar orientações ou em se adaptar a determinadas circunstâncias, ocorreram outras vezes. No entanto, por meio de conselhos frequentes, percebemos que ele estava se esforçando para melhorar. A dificuldade observada é que, embora consiga colocar os conselhos em prática por algum tempo, nem sempre mantém esse progresso de maneira consistente. Não podemos afirmar a causa disso, mas consideramos que suas dificuldades emocionais podem estar entre os fatores que merecem atenção.

Outro aspecto que observamos é que o irmão demonstra desconforto quando sente que está sendo pressionado a fazer algo.

Em março de 2026, quando o casal ainda servia como pioneiro regular, foi necessário conversar com eles durante o período em que os anciãos se reúnem com os pioneiros que estão enfrentando dificuldades para cumprir o requisito de horas. Naquela ocasião, a irmã não trabalhava fora, e a carga horária de trabalho secular do irmão era de aproximadamente 30 horas mensais. Apesar disso, ambos estavam consideravelmente atrasados nas horas de serviço de campo.

Procuramos entender a situação e perguntamos se havia algo que pudéssemos fazer para ajudá-los. Havíamos observado que participavam no ministério de campo geralmente uma vez por semana e que completavam o restante das horas principalmente por meio da pregação por cartas. Eles reconheceram que precisavam melhorar e admitiram que, em algumas ocasiões, acabavam dedicando muito tempo a atividades menos importantes.

Entretanto, tivemos a impressão de que o irmão considerou que os anciãos não compreendiam plenamente as circunstâncias que enfrentavam. No mês seguinte, o casal realizou ainda menos horas de serviço de campo. Por mensagem, o irmão nos informou que estavam deixando o serviço de pioneiro e que não seria necessário conversar novamente sobre o assunto, pois havíamos tratado dele pouco tempo antes.

Respeitamos a decisão do casal. Desde então, temos observado que sua participação no ministério de campo se concentra principalmente no dia em que há o arranjo para a pregação por cartas e, no caso do irmão, uma vez por mês, quando dirige o serviço de campo.

Essa mudança chama nossa atenção porque, quando chegaram à congregação, eram bastante ativos no ministério e participavam de várias saídas de campo durante a semana. Com o passar do tempo, porém, demonstraram dificuldade em manter o mesmo ritmo de atividade. Não sabemos ao certo quais fatores contribuem para essa mudança, mas consideramos que suas dificuldades emocionais podem ter alguma relação com isso.

### Avaliação e recomendação

Apesar dos aspectos mencionados, reconhecemos que o irmão Fulano tem qualidades e capacidades que têm sido úteis à congregação. Considerando sua reação aos conselhos recentes, os esforços que demonstrou para colocar em prática as orientações recebidas e uma avaliação equilibrada dos requisitos bíblicos para servo ministerial, o corpo de anciãos entende que ele preenche de maneira razoável esses requisitos. Por esse motivo, recomendamos o irmão para continuar servindo como servo ministerial.

Consideramos importante, contudo, compartilhar essas informações para que o corpo de anciãos da Congregação de Cidade tenha conhecimento do histórico do casal e possa dar continuidade à assistência de que necessitam. Em especial, esperamos que essas informações ajudem os irmãos a encontrar maneiras apropriadas de incentivá-los a reconhecer a importância de buscar ajuda médica ou acompanhamento especializado para lidar com suas dificuldades emocionais.

Nosso desejo é que ambos recebam o apoio necessário para enfrentar essas dificuldades, fortalecer seus relacionamentos com os irmãos e continuar servindo fielmente a Jeová, na medida de suas circunstâncias.`;

function LetterGeneratorPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();

    const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");

    // Estado da carta (100% mantido em memória - sem persistência em banco)
    const [letterData, setLetterData] = useState<ILetterData>(() => ({
        ...DEFAULT_LETTER_DATA,
        date: dayjs().format("YYYY-MM-DD"),
        congregationName: congregation?.name || "",
        congregationNumber: congregation?.number || "",
        congregationAddress: congregation?.address || "",
        congregationCity: congregation?.city || "",
        additionalFooterNote: congregation?.name
            ? `Corpo de anciãos da Congregação ${congregation.name}`
            : "Corpo de anciãos da Congregação",
    }));

    // Preenche cabeçalho com a congregação quando carregar
    useEffect(() => {
        if (congregation) {
            setLetterData(prev => ({
                ...prev,
                congregationName: prev.congregationName || congregation.name || "",
                congregationNumber: prev.congregationNumber || congregation.number || "",
                congregationAddress: prev.congregationAddress || congregation.address || "",
                congregationCity: prev.congregationCity || congregation.city || "",
                additionalFooterNote: prev.additionalFooterNote || `Corpo de anciãos da Congregação ${congregation.name}`,
            }));
        }
    }, [congregation]);

    useEffect(() => {
        setPageActive("Gerador de cartas");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Documentos", link: "/documentos/meiodesemana" },
            { label: "Gerador de cartas", link: "/documentos/gerador" }
        ]);
    }, [setPageActive, setCrumbs]);

    // Atualizadores genéricos
    const handleFieldChange = (field: keyof ILetterData, value: any) => {
        setLetterData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignatureChange = (index: number, key: "name" | "role", value: string) => {
        setLetterData(prev => {
            const nextSignatures = [...prev.signatures];
            nextSignatures[index] = { ...nextSignatures[index], [key]: value };
            return { ...prev, signatures: nextSignatures };
        });
    };

    // Ações rápidas
    const handleInsertSampleText = () => {
        setLetterData(prev => ({
            ...prev,
            destinationCongregation: "À Congregação José da Penha – RN (85.120)",
            destinationAttention: "Corpo de Anciãos",
            subject: "Envio de cartões e carta de apresentação",
            salutation: "Prezados irmãos,",
            bodyRaw: SAMPLE_PRESENTATION_TEXT,
            documentTitle: "Carta de apresentação",
            signatures: [
                { name: "Nome do Coordenador", role: "Coordenador" },
                { name: "Nome do Secretário", role: "Secretário" },
                { name: "Nome do Sup. Serviço", role: "SS" },
            ]
        }));
        toast.info("Modelo de exemplo de carta de apresentação carregado!");
    };

    const handleClearAll = () => {
        if (window.confirm("Deseja realmente limpar todos os campos da carta? Os dados não salvos serão descartados.")) {
            setLetterData({
                ...DEFAULT_LETTER_DATA,
                date: dayjs().format("YYYY-MM-DD"),
                congregationName: congregation?.name || "",
                congregationNumber: congregation?.number || "",
                congregationAddress: congregation?.address || "",
                congregationCity: congregation?.city || "",
                additionalFooterNote: congregation?.name
                    ? `Corpo de anciãos da Congregação ${congregation.name}`
                    : "",
            });
            toast.success("Campos limpos com sucesso.");
        }
    };

    const handleInsertHeadingShortcut = () => {
        const headingSnippet = "\n\n### Título da Seção\n\n";
        setLetterData(prev => ({
            ...prev,
            bodyRaw: (prev.bodyRaw ? prev.bodyRaw.trimEnd() : "") + headingSnippet,
        }));
    };

    const fileName = useMemo(() => {
        const cleanSubject = (letterData.subject || "Carta")
            .toLowerCase()
            .replace(/[^a-z0-9]/gi, "_")
            .replace(/_+/g, "_");
        return `${cleanSubject}_${letterData.date || dayjs().format("YYYY-MM-DD")}.pdf`;
    }, [letterData.subject, letterData.date]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Gerador de cartas" />

            <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 sm:p-6 min-w-0">
                {/* Banner de Título & Confidencialidade */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-primary-100/20 text-primary-200 shrink-0 mt-0.5">
                            <FileSignature className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                                    Gerador de Cartas e Documentos
                                </h1>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                    <Lock className="w-3 h-3" />
                                    100% Confidencial na Memória
                                </span>
                            </div>
                            <p className="text-xs text-typography-500 mt-1 max-w-2xl leading-relaxed">
                                Crie e exporte cartas oficiais com diagramação institucional idêntica ao modelo impresso. Nenhum dado digitado ou colado é enviado ou gravado no servidor.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleInsertSampleText}
                            className="text-xs gap-1.5 border-surface-300 text-typography-700 hover:bg-surface-200"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Carregar Exemplo</span>
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1.5"
                            title="Limpar campos do formulário"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Limpar</span>
                        </Button>
                    </div>
                </div>

                {/* Alternador Mobile (Formulário / Preview) */}
                <div className="flex lg:hidden bg-surface-200 p-1 rounded-xl border border-surface-300">
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("form")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTabMobile === "form"
                                ? "bg-surface-100 text-typography-900 shadow-xs"
                                : "text-typography-600 hover:text-typography-900"
                        }`}
                    >
                        Formulário & Conteúdo
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("preview")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTabMobile === "preview"
                                ? "bg-surface-100 text-typography-900 shadow-xs"
                                : "text-typography-600 hover:text-typography-900"
                        }`}
                    >
                        Visualização da Folha
                    </button>
                </div>

                {/* Grid Principal: Formulário à Esquerda | Preview A4 à Direita */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* COLUNA ESQUERDA: FORMULÁRIO (7 colunas no desktop) */}
                    <div className={`lg:col-span-6 flex flex-col gap-5 ${activeTabMobile === "preview" ? "hidden lg:flex" : ""}`}>
                        {/* 1. Cabeçalho Remetente */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200">
                                <Building2 className="w-4 h-4 text-primary-200" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                    Cabeçalho da Congregação (Remetente)
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Nome da Congregação
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationName}
                                        onChange={e => handleFieldChange("congregationName", e.target.value)}
                                        placeholder="Ex: LUIS GOMES"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Número da Congregação
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationNumber}
                                        onChange={e => handleFieldChange("congregationNumber", e.target.value)}
                                        placeholder="Ex: 86.249"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Endereço Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationAddress}
                                        onChange={e => handleFieldChange("congregationAddress", e.target.value)}
                                        placeholder="Ex: Mãe Regina, 54, Centro"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        CEP
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationZipCode}
                                        onChange={e => handleFieldChange("congregationZipCode", e.target.value)}
                                        placeholder="Ex: 59940-000"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationCity}
                                        onChange={e => handleFieldChange("congregationCity", e.target.value)}
                                        placeholder="Ex: Luis Gomes"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        UF (Estado)
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationState}
                                        onChange={e => handleFieldChange("congregationState", e.target.value)}
                                        placeholder="Ex: RN"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800 uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Destinatário e Informações Principais */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200">
                                <FileText className="w-4 h-4 text-primary-200" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                    Data e Destinatário
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Calendar
                                    label="Data da Carta"
                                    selectedDate={letterData.date || null}
                                    handleDateChange={(d) => handleFieldChange("date", d || "")}
                                    full
                                />

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Destinatário (Para)
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.destinationCongregation}
                                        onChange={e => handleFieldChange("destinationCongregation", e.target.value)}
                                        placeholder="Ex: À Congregação José da Penha – RN (85.120)"
                                        className="p-2.5 text-xs border rounded-xl bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800 mt-auto"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Aos cuidados de (A/C)
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.destinationAttention}
                                        onChange={e => handleFieldChange("destinationAttention", e.target.value)}
                                        placeholder="Ex: Corpo de Anciãos / Nome da pessoa"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Saudação Inicial
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.salutation}
                                        onChange={e => handleFieldChange("salutation", e.target.value)}
                                        placeholder="Ex: Prezados irmãos,"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-typography-700">
                                    Assunto da Carta
                                </label>
                                <input
                                    type="text"
                                    value={letterData.subject}
                                    onChange={e => handleFieldChange("subject", e.target.value)}
                                    placeholder="Ex: Envio de cartões e carta de apresentação"
                                    className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800 font-semibold"
                                />
                            </div>
                        </div>

                        {/* 3. Corpo da Carta */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <FileEdit className="w-4 h-4 text-primary-200" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                        Corpo da Carta
                                    </h3>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleInsertHeadingShortcut}
                                    className="text-[11px] h-7 gap-1 border-surface-300 text-primary-200 hover:bg-surface-200"
                                    title="Inserir título de seção destacado"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Adicionar Subtítulo</span>
                                </Button>
                            </div>

                            <p className="text-[11px] text-typography-500 leading-relaxed">
                                Cole aqui os parágrafos normalmente. Subtítulos iniciados com <code className="text-primary-200 font-semibold">###</code> ou linhas isoladas sem ponto final serão destacados em negrito automaticamente.
                            </p>

                            <textarea
                                rows={14}
                                value={letterData.bodyRaw}
                                onChange={e => handleFieldChange("bodyRaw", e.target.value)}
                                placeholder="Cole ou digite aqui o texto da carta..."
                                className="w-full p-3.5 text-xs font-mono leading-relaxed border rounded-xl bg-surface-100 border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200/20 focus:border-primary-200 text-typography-800 resize-y"
                            />
                        </div>

                        {/* 4. Conclusão e Assinaturas */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200">
                                <Users className="w-4 h-4 text-primary-200" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                    Despedida e Assinaturas
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Frase de Conclusão
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.signOffPhrase}
                                        onChange={e => handleFieldChange("signOffPhrase", e.target.value)}
                                        placeholder="Ex: Desejamos que as ricas bênçãos de Jeová..."
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Despedida
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.closing}
                                        onChange={e => handleFieldChange("closing", e.target.value)}
                                        placeholder="Ex: Seus irmãos,"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-1">
                                <label className="text-xs font-semibold text-typography-700">
                                    Irmãos que assinam a carta
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {letterData.signatures.map((sig, idx) => (
                                        <div key={idx} className="p-2.5 rounded-xl border border-surface-300 bg-surface-200/40 flex flex-col gap-2">
                                            <span className="text-[10px] font-bold text-typography-500 uppercase">
                                                Assinatura {idx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={sig.name}
                                                onChange={e => handleSignatureChange(idx, "name", e.target.value)}
                                                placeholder="Nome completo"
                                                className="p-1.5 text-xs border rounded-md bg-surface-100 border-surface-300 text-typography-800"
                                            />
                                            <input
                                                type="text"
                                                value={sig.role}
                                                onChange={e => handleSignatureChange(idx, "role", e.target.value)}
                                                placeholder="Função (Ex: Coordenador)"
                                                className="p-1.5 text-xs border rounded-md bg-surface-100 border-surface-300 text-typography-800"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Nota abaixo das assinaturas (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.additionalFooterNote}
                                        onChange={e => handleFieldChange("additionalFooterNote", e.target.value)}
                                        placeholder="Ex: Corpo de anciãos da Congregação..."
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Título no Rodapé da Página
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.documentTitle}
                                        onChange={e => handleFieldChange("documentTitle", e.target.value)}
                                        placeholder="Ex: Carta de apresentação"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Barra de Exportação Flutuante no Mobile */}
                        <div className="sticky bottom-4 z-20 flex items-center gap-3 p-3.5 bg-surface-100/90 backdrop-blur-md border border-surface-300 rounded-2xl shadow-lg">
                            <BlobProvider document={<LetterPdfDocument data={letterData} />}>
                                {({ url, loading, error }) => {
                                    const isDisabled = loading || !!error || !url;
                                    return (
                                        <>
                                            <a
                                                href={url || "#"}
                                                download={fileName}
                                                className={`flex-1 ${isDisabled ? "pointer-events-none" : ""}`}
                                            >
                                                <Button
                                                    disabled={isDisabled}
                                                    className="w-full bg-primary-200 hover:bg-primary-300 text-white font-bold text-xs gap-2 h-10 shadow-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>{loading ? "Gerando PDF..." : "Baixar Carta em PDF"}</span>
                                                </Button>
                                            </a>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (url) window.open(url, "_blank");
                                                }}
                                                className="h-10 text-xs gap-1.5 border-surface-300 hover:bg-surface-200 shrink-0"
                                                title="Visualizar PDF no navegador"
                                            >
                                                <ExternalLink className="w-4 h-4 text-typography-600" />
                                                <span className="hidden sm:inline">Visualizar</span>
                                            </Button>
                                        </>
                                    );
                                }}
                            </BlobProvider>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: PREVIEW DA FOLHA A4 (6 colunas no desktop) */}
                    <div className={`lg:col-span-6 flex flex-col gap-3 sticky top-4 ${activeTabMobile === "form" ? "hidden lg:flex" : ""}`}>
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-typography-700 uppercase tracking-wider">
                                <Eye className="w-4 h-4 text-primary-200" />
                                <span>Visualização A4 em Tempo Real</span>
                            </div>

                            <BlobProvider document={<LetterPdfDocument data={letterData} />}>
                                {({ url, loading }) => (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={loading || !url}
                                        onClick={() => {
                                            if (url) window.open(url, "_blank");
                                        }}
                                        className="h-7 text-xs border-surface-300 gap-1.5"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Abrir PDF</span>
                                    </Button>
                                )}
                            </BlobProvider>
                        </div>

                        {/* Contêiner de Preview */}
                        <div className="max-h-[85vh] overflow-y-auto p-3 sm:p-5 bg-zinc-200/60 dark:bg-zinc-900/60 rounded-2xl border border-surface-300 shadow-inner flex justify-center">
                            <LetterLivePreview data={letterData} />
                        </div>
                    </div>
                </div>
            </div>
        </ContentDashboard>
    );
}

LetterGeneratorPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"]);

export default LetterGeneratorPage;

