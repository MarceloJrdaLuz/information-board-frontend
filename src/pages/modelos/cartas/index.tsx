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
    Bold,
    Building2,
    Download,
    ExternalLink,
    Eye,
    FileEdit,
    FileSignature,
    FileText,
    HardDrive,
    Heading,
    Italic,
    Layers,
    Loader2,
    Lock,
    RotateCcw,
    Save,
    Sparkles,
    Trash2,
    Users
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const DRAFT_STORAGE_KEY = "@information_board:letter_presentation_draft";

interface IDraftStorage {
    savedAt: string;
    data: ILetterData;
}

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
    const [previewMode, setPreviewMode] = useState<"sheets" | "pdf">("sheets");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Estado da carta (mantido em memória com opção de salvar rascunho no dispositivo)
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

    // Informação do rascunho gravado no dispositivo local
    const [savedDraftInfo, setSavedDraftInfo] = useState<IDraftStorage | null>(null);

    // Verifica rascunho salvo no dispositivo ao carregar
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (raw) {
                const parsed: IDraftStorage = JSON.parse(raw);
                if (parsed && parsed.data && parsed.savedAt) {
                    setSavedDraftInfo(parsed);
                }
            }
        } catch (e) {
            console.error("Erro ao verificar rascunho no dispositivo:", e);
        }
    }, []);

    // Versão com debounce leve para o PDF não reprocessar a cada letra digitada
    const [debouncedLetterData, setDebouncedLetterData] = useState<ILetterData>(letterData);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLetterData(letterData);
        }, 350);
        return () => clearTimeout(timer);
    }, [letterData]);

    // Preenche cabeçalho com a congregação quando carregar
    useEffect(() => {
        if (congregation) {
            setLetterData(prev => ({
                ...prev,
                congregationName: prev.congregationName || congregation.name || "",
                congregationNumber: prev.congregationNumber || congregation.number || "",
                congregationAddress: prev.congregationAddress || congregation.address || "",
                congregationCity: prev.congregationCity || congregation.city || "",
                additionalFooterNote: prev.additionalFooterNote || (congregation.name
                    ? `Corpo de anciãos da Congregação ${congregation.name}`
                    : "Corpo de anciãos da Congregação"),
            }));
        }
    }, [congregation]);

    // Configuração de breadcrumbs e menu ativo
    useEffect(() => {
        setPageActive("/modelos/cartas");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Modelos", link: "/modelos/cartas" },
            { label: "Carta de apresentação", link: "/modelos/cartas" }
        ]);
    }, [setCrumbs, setPageActive]);

    const handleFieldChange = (field: keyof ILetterData, value: any) => {
        setLetterData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignatureChange = (index: number, field: "name" | "role", value: string) => {
        setLetterData(prev => {
            const nextSignatures = [...prev.signatures];
            nextSignatures[index] = {
                ...nextSignatures[index],
                [field]: value
            };
            return { ...prev, signatures: nextSignatures };
        });
    };

    const handleSaveDraftToDevice = () => {
        try {
            const payload: IDraftStorage = {
                savedAt: new Date().toISOString(),
                data: letterData,
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
            setSavedDraftInfo(payload);
            toast.success("Rascunho salvo com sucesso neste dispositivo! (Nenhum dado enviado à nuvem)");
        } catch (e) {
            console.error("Erro ao salvar rascunho no dispositivo:", e);
            toast.error("Não foi possível salvar o rascunho neste dispositivo.");
        }
    };

    const handleRestoreDraftFromDevice = () => {
        if (!savedDraftInfo) return;
        setLetterData(savedDraftInfo.data);
        toast.success("Rascunho salvo neste dispositivo restaurado com sucesso!");
    };

    const handleDeleteDraftFromDevice = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setSavedDraftInfo(null);
            toast.info("Rascunho excluído deste dispositivo.");
        } catch (e) {
            console.error("Erro ao excluir rascunho:", e);
        }
    };

    const handleLoadSample = () => {
        setLetterData({
            congregationName: congregation?.name || "LUIS GOMES",
            congregationNumber: congregation?.number || "86249",
            congregationAddress: congregation?.address || "Mãe Regina, 54, Centro",
            congregationCity: congregation?.city || "Luis Gomes",
            congregationState: "RN",
            congregationZipCode: "59940-000",
            date: dayjs().format("YYYY-MM-DD"),
            destinationCongregation: "À Congregação José da Penha – RN (85.120)",
            destinationAttention: "Corpo de Anciãos",
            subject: "Envio de cartões e carta de apresentação",
            salutation: "Prezados irmãos,",
            bodyRaw: SAMPLE_PRESENTATION_TEXT,
            signOffPhrase: "Desejamos que as ricas bênçãos de Jeová estejam sobre o trabalho de vocês.",
            closing: "Seus irmãos,",
            signatures: [
                { name: "Marcelo Junior da Luz", role: "Coordenador" },
                { name: "Marcelo Junior da Luz", role: "Secretário" },
                { name: "Ilélio Jorge Gonçalves Correia", role: "Superintendente de Serviço" },
            ],
            additionalFooterNote: `Corpo de anciãos da Congregação ${congregation?.name || "Luís Gomes"}`,
            documentTitle: "Carta de apresentação",
        });
        toast.success("Carta modelo de apresentação carregada com sucesso!");
    };

    const handleClearForm = () => {
        setLetterData({
            ...DEFAULT_LETTER_DATA,
            date: dayjs().format("YYYY-MM-DD"),
            congregationName: congregation?.name || "",
            congregationNumber: congregation?.number || "",
            congregationAddress: congregation?.address || "",
            congregationCity: congregation?.city || "",
            additionalFooterNote: congregation?.name
                ? `Corpo de anciãos da Congregação ${congregation.name}`
                : "Corpo de anciãos da Congregação",
        });
        toast.info("Campos da tela limpos.");
    };

    // Aplica formatação inline (Negrito ** ou Itálico *) na seleção atual do textarea
    const applyWrapSelection = (prefix: string, suffix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const selected = value.substring(start, end);

        let newText = "";
        let newStart = start;
        let newEnd = end;

        const isAlreadyWrapped =
            start >= prefix.length &&
            end + suffix.length <= value.length &&
            value.substring(start - prefix.length, start) === prefix &&
            value.substring(end, end + suffix.length) === suffix;

        if (isAlreadyWrapped) {
            newText =
                value.substring(0, start - prefix.length) +
                selected +
                value.substring(end + suffix.length);
            newStart = start - prefix.length;
            newEnd = end - prefix.length;
        } else {
            const placeholder = selected || "texto destacado";
            newText =
                value.substring(0, start) +
                prefix +
                placeholder +
                suffix +
                value.substring(end);
            newStart = start + prefix.length;
            newEnd = start + prefix.length + placeholder.length;
        }

        handleFieldChange("bodyRaw", newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newStart, newEnd);
        }, 10);
    };

    // Alterna subtítulo na linha atual (adiciona ou remove ###)
    const handleToggleHeading = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const value = textarea.value;

        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        let lineEnd = value.indexOf("\n", start);
        if (lineEnd === -1) lineEnd = value.length;

        const line = value.substring(lineStart, lineEnd);
        let newLine = "";

        if (line.startsWith("### ")) {
            newLine = line.replace(/^###\s+/, "");
        } else {
            newLine = `### ${line.replace(/^#{1,3}\s*/, "")}`;
        }

        const newText = value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        handleFieldChange("bodyRaw", newText);
        setTimeout(() => {
            textarea.focus();
            const newPos = lineStart + newLine.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 10);
    };

    const fileName = useMemo(() => {
        const dest = (letterData.destinationCongregation || "carta")
            .toLowerCase()
            .replace(/[^a-z0-9]/gi, "_")
            .slice(0, 30);
        const dateStr = letterData.date || dayjs().format("YYYY-MM-DD");
        return `carta_apresentacao_${dest}_${dateStr}.pdf`;
    }, [letterData.destinationCongregation, letterData.date]);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Carta de apresentação" />

                {/* Banner de Cabeçalho com Alerta de Confidencialidade e Acesso Restrito */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-3 bg-primary-200/10 text-primary-200 rounded-2xl shrink-0">
                            <FileSignature className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                                    Carta de Apresentação e Recomendação
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="Armazenamento seguro neste aparelho físico sem envio a servidores ou nuvem">
                                    <HardDrive className="w-3 h-3" />
                                    Salvo no Dispositivo (Sem Nuvem)
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                                    Apenas Anciãos
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-typography-600 mt-1 leading-relaxed">
                                Preencha ou cole o texto da carta. Se desejar, salve um rascunho <strong>exclusivamente neste dispositivo</strong> para continuar depois.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSaveDraftToDevice}
                            className="gap-1.5 text-xs border-primary-200/50 text-primary-200 hover:bg-primary-200/10 font-semibold shadow-2xs"
                            title="Salva os dados digitados exclusivamente neste dispositivo (computador/celular), sem enviar nada para a nuvem"
                        >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Salvar Rascunho no Dispositivo</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLoadSample}
                            className="gap-1.5 text-xs border-surface-300 hover:bg-surface-200 text-typography-700"
                            title="Carregar texto da carta de apresentação modelo"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Carregar Exemplo</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearForm}
                            className="gap-1.5 text-xs border-surface-300 hover:bg-surface-200 text-red-500 hover:text-red-600"
                            title="Limpar campos da tela"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Limpar</span>
                        </Button>
                    </div>
                </div>

                {/* Card Informativo de Rascunho Salvo no Dispositivo */}
                {savedDraftInfo && (
                    <div className="bg-surface-100 border border-primary-200/40 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary-200/10 text-primary-200 rounded-xl shrink-0">
                                <HardDrive className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-typography-800">
                                        Rascunho salvo neste dispositivo
                                    </span>
                                    <span className="text-[11px] bg-primary-200/10 text-primary-200 px-2 py-0.5 rounded-full font-semibold">
                                        Salvo em {dayjs(savedDraftInfo.savedAt).format("DD/MM/YYYY [às] HH:mm")}
                                    </span>
                                </div>
                                <p className="text-[11px] text-typography-500 mt-0.5 leading-relaxed">
                                    Este rascunho está armazenado <strong>apenas na memória deste aparelho físico</strong> (offline e 100% privado, sem qualquer envio para a nuvem ou servidores).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleRestoreDraftFromDevice}
                                className="h-8 text-xs gap-1.5 bg-primary-200 hover:bg-primary-300 text-white font-semibold shadow-2xs"
                                title="Preencher os campos da tela com o rascunho deste dispositivo"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restaurar Rascunho</span>
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleDeleteDraftFromDevice}
                                className="h-8 text-xs gap-1.5 border-surface-300 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                title="Excluir o rascunho salvo deste aparelho"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir do dispositivo</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Alternador Mobile (Formulário vs Prévia) */}
                <div className="flex lg:hidden bg-surface-200/80 p-1 rounded-xl border border-surface-300 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("form")}
                        className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            activeTabMobile === "form"
                                ? "bg-surface-100 text-primary-200 shadow-xs"
                                : "text-typography-600 hover:text-typography-800"
                        }`}
                    >
                        <FileEdit className="w-4 h-4" />
                        <span>Preencher Formulário</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("preview")}
                        className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            activeTabMobile === "preview"
                                ? "bg-surface-100 text-primary-200 shadow-xs"
                                : "text-typography-600 hover:text-typography-800"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        <span>Visualização Folhas A4</span>
                    </button>
                </div>

                {/* Grid Principal: Dividido em 2 colunas no desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* COLUNA ESQUERDA: FORMULÁRIO (6 colunas no desktop) */}
                    <div className={`lg:col-span-6 flex flex-col gap-4 ${activeTabMobile === "preview" ? "hidden lg:flex" : ""}`}>
                        {/* 1. Congregação Remetente */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary-200" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                        Congregação Remetente (Cabeçalho)
                                    </h3>
                                </div>
                                <span className="text-[11px] text-typography-500 italic">
                                    Preenchido automaticamente
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Nome da Congregação
                                    </label>
                                    <input
                                        type="text"
                                        value={letterData.congregationName}
                                        onChange={e => handleFieldChange("congregationName", e.target.value)}
                                        placeholder="Ex: LUIS GOMES"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800 uppercase font-semibold"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Número
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

                        {/* 3. Corpo da Carta com Barra de Ferramentas de Estilo */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-surface-200 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <FileEdit className="w-4 h-4 text-primary-200" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                        Corpo da Carta
                                    </h3>
                                </div>

                                {/* Barra de Ferramentas de Formatação Manual */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => applyWrapSelection("**", "**")}
                                        className="text-[11px] h-7 px-2.5 gap-1 border-surface-300 text-typography-700 hover:bg-surface-200"
                                        title="Negrito: **texto** (Ctrl+B)"
                                    >
                                        <Bold className="w-3.5 h-3.5" />
                                        <span className="font-bold">Negrito</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => applyWrapSelection("*", "*")}
                                        className="text-[11px] h-7 px-2.5 gap-1 border-surface-300 text-typography-700 hover:bg-surface-200"
                                        title="Itálico: *texto* (Ctrl+I)"
                                    >
                                        <Italic className="w-3.5 h-3.5" />
                                        <span className="italic">Itálico</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleToggleHeading}
                                        className="text-[11px] h-7 px-2.5 gap-1 border-surface-300 text-primary-200 hover:bg-surface-200"
                                        title="Subtítulo: Adiciona ou remove ### na linha"
                                    >
                                        <Heading className="w-3.5 h-3.5" />
                                        <span>Subtítulo</span>
                                    </Button>
                                </div>
                            </div>

                            <p className="text-[11px] text-typography-500 leading-relaxed">
                                Selecione um trecho e use os botões acima ou atalhos (<code className="text-primary-200 font-semibold">Ctrl+B</code> para <strong>negrito</strong>, <code className="text-primary-200 font-semibold">Ctrl+I</code> para <em>itálico</em>). Linhas iniciadas com <code className="text-primary-200 font-semibold">###</code> viram subtítulos destacados (remova os <code className="text-primary-200 font-semibold">###</code> para voltar a texto normal).
                            </p>

                            <textarea
                                ref={textareaRef}
                                rows={14}
                                value={letterData.bodyRaw}
                                onChange={e => handleFieldChange("bodyRaw", e.target.value)}
                                onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                                        e.preventDefault();
                                        applyWrapSelection("**", "**");
                                    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
                                        e.preventDefault();
                                        applyWrapSelection("*", "*");
                                    }
                                }}
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
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-typography-700">
                                        Irmãos que assinam a carta
                                    </label>
                                    <span className="text-[11px] text-typography-500 italic">
                                        Nome acima da linha · Privilégio abaixo da linha
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {letterData.signatures.map((sig, idx) => (
                                        <div key={idx} className="p-2.5 rounded-xl border border-surface-300 bg-surface-200/40 flex flex-col gap-2">
                                            <span className="text-[10px] font-bold text-typography-500 uppercase">
                                                Assinatura {idx + 1}
                                            </span>
                                            <div className="flex flex-col gap-0.5">
                                                <label className="text-[10px] text-typography-500">Nome (acima da linha)</label>
                                                <input
                                                    type="text"
                                                    value={sig.name}
                                                    onChange={e => handleSignatureChange(idx, "name", e.target.value)}
                                                    placeholder="Nome completo"
                                                    className="p-1.5 text-xs border rounded-md bg-surface-100 border-surface-300 text-typography-800"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <label className="text-[10px] text-typography-500">Privilégio (abaixo da linha)</label>
                                                <input
                                                    type="text"
                                                    value={sig.role}
                                                    onChange={e => handleSignatureChange(idx, "role", e.target.value)}
                                                    placeholder="Função (Ex: Coordenador)"
                                                    className="p-1.5 text-xs border rounded-md bg-surface-100 border-surface-300 text-typography-800"
                                                />
                                            </div>
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

                        {/* Barra de Ações Flutuante */}
                        <div className="sticky bottom-4 z-20 flex items-center gap-3 p-3.5 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-2xl shadow-lg">
                            <BlobProvider document={<LetterPdfDocument data={debouncedLetterData} />}>
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

                    {/* COLUNA DIREITA: PREVIEW (6 colunas no desktop) */}
                    <div className={`lg:col-span-6 flex flex-col gap-3 sticky top-4 ${activeTabMobile === "form" ? "hidden lg:flex" : ""}`}>
                        {/* Seletor de Modo de Visualização */}
                        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 bg-surface-200/90 p-1 rounded-xl border border-surface-300 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("sheets")}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        previewMode === "sheets"
                                            ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                                            : "text-typography-600 hover:text-typography-800"
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Folhas A4</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("pdf")}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        previewMode === "pdf"
                                            ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                                            : "text-typography-600 hover:text-typography-800"
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>PDF Oficial</span>
                                </button>
                            </div>

                            <BlobProvider document={<LetterPdfDocument data={debouncedLetterData} />}>
                                {({ url, loading }) => (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={loading || !url}
                                        onClick={() => {
                                            if (url) window.open(url, "_blank");
                                        }}
                                        className="h-8 text-xs border-surface-300 gap-1.5 hover:bg-surface-200"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Abrir em Nova Aba</span>
                                    </Button>
                                )}
                            </BlobProvider>
                        </div>

                        {/* Contêiner de Visualização */}
                        {previewMode === "sheets" ? (
                            <div className="max-h-[85vh] overflow-y-auto p-3 sm:p-5 bg-zinc-200/70 dark:bg-zinc-900/70 rounded-2xl border border-surface-300 shadow-inner flex justify-center">
                                <LetterLivePreview data={letterData} />
                            </div>
                        ) : (
                            <div className="h-[85vh] w-full rounded-2xl border border-surface-300 shadow-inner bg-zinc-200/50 overflow-hidden flex flex-col justify-center items-center">
                                <BlobProvider document={<LetterPdfDocument data={debouncedLetterData} />}>
                                    {({ url, loading, error }) => {
                                        if (loading) {
                                            return (
                                                <div className="flex flex-col items-center justify-center gap-3 p-8 text-typography-500">
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary-200" />
                                                    <span className="text-xs font-medium">Renderizando páginas do PDF...</span>
                                                </div>
                                            );
                                        }
                                        if (error || !url) {
                                            return (
                                                <div className="flex flex-col items-center justify-center gap-2 p-8 text-red-500 text-center">
                                                    <AlertCircle className="w-8 h-8" />
                                                    <span className="text-xs font-semibold">Erro ao renderizar PDF. Use a visualização em Folhas A4.</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <iframe
                                                src={`${url}#toolbar=0&navpanes=0`}
                                                className="w-full h-full border-0 bg-white"
                                                title="Pré-visualização do Documento PDF Oficial"
                                            />
                                        );
                                    }}
                                </BlobProvider>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentDashboard>
    );
}

// Protegido EXCLUSIVAMENTE para ADMIN_CONGREGATION
LetterGeneratorPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"]);

export default LetterGeneratorPage;
