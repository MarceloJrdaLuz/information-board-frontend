import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import {
    ArrowRight,
    CreditCard,
    DollarSign,
    FileSignature,
    FileText,
    Globe,
    HardDrive,
    Lock,
    Shield,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

const DOCUMENT_MODELS = [
    {
        id: "cartas",
        title: "Carta de Apresentação",
        subtitle: "Apresentação e Mudança de Publicadores",
        description:
            "Carta formal para recomendar e apresentar publicadores que estão se mudando para uma nova congregação, com histórico espiritual e dados ministeriais.",
        href: "/modelos/cartas",
        category: "Secretaria",
        icon: FileText,
        colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        accentGradient: "from-blue-500 to-cyan-500",
    },
    {
        id: "declaracao-conta",
        title: "Declaração de Conta Bancária",
        subtitle: "Titularidade de Recursos Congregacionais",
        description:
            "Declaração assinada pelo titular da conta atestando que os valores depositados pertencem à congregação e à Associação Bíblica e Cultural.",
        href: "/modelos/declaracao-conta",
        category: "Contabilidade",
        icon: CreditCard,
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        accentGradient: "from-emerald-500 to-teal-500",
    },
    {
        id: "previsao-gastos",
        title: "Registro de Previsão de Gastos",
        subtitle: "Limite do Saldo Reserva em Conta",
        description:
            "Documento formal do corpo de anciãos fixando o teto máximo de saldo reserva mantido na conta bancária da congregação.",
        href: "/modelos/previsao-gastos",
        category: "Finanças",
        icon: DollarSign,
        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        accentGradient: "from-amber-500 to-yellow-500",
    },
    {
        id: "autorizados-pagamentos",
        title: "Autorizados a Fazer Pagamentos",
        subtitle: "Delegação de Pagamentos em Conta",
        description:
            "Relação oficial dos irmãos autorizados pelo corpo de anciãos a emitir e liquidar despesas utilizando os recursos da congregação.",
        href: "/modelos/autorizados-pagamentos",
        category: "Contas",
        icon: ShieldCheck,
        colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        accentGradient: "from-indigo-500 to-purple-500",
    },
    {
        id: "resolucao-obra-mundial",
        title: "Resolução para Obra Mundial",
        subtitle: "Donativo Mensal Periódico",
        description:
            "Formalização da resolução votada pela congregação para envio mensal de donativo à Obra Mundial para o ano de serviço.",
        href: "/modelos/resolucao-obra-mundial",
        category: "Resoluções",
        icon: Globe,
        colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        accentGradient: "from-teal-500 to-cyan-600",
    },
    {
        id: "pagamentos-cca",
        title: "Pagamentos Aprovados pelo CCA",
        subtitle: "Alçada de Despesas Operacionais de Rotina",
        description:
            "Aprovação do corpo de anciãos permitindo ao Coordenador liquidar gastos rotineiros do Salão do Reino até um limite pré-fixado.",
        href: "/modelos/pagamentos-cca",
        category: "Administrativo",
        icon: Shield,
        colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        accentGradient: "from-purple-500 to-pink-500",
    },
];

function ModelosHubPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    useEffect(() => {
        setPageActive("/modelos");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Modelos de Documentos", link: "/modelos" },
        ]);
    }, [setCrumbs, setPageActive]);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Modelos de Documentos" />

                {/* Banner Principal com Segurança Local */}
                <div className="relative overflow-hidden bg-gradient-to-br from-surface-100 via-surface-100 to-surface-200/50 border border-surface-300 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-200/10 text-primary-200 border border-primary-200/20">
                                <FileSignature className="w-3.5 h-3.5" />
                                Central de Documentos
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <HardDrive className="w-3.5 h-3.5" />
                                Salvo Exclusivamente no Dispositivo
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                                Apenas Anciãos
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-900 tracking-tight">
                            Modelos Oficiais e Cartas Prontas
                        </h1>

                        <p className="text-sm sm:text-base text-typography-600 leading-relaxed">
                            Gere cartas, termos e resoluções no formato exato padrão das congregações. Preencha os campos, personalize textos à vontade, visualize em tempo real na folha A4 e exporte para PDF de alta fidelidade.
                        </p>

                        <div className="pt-2 flex items-center gap-2 text-xs text-typography-500">
                            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>
                                <strong>Privacidade absoluta:</strong> Os dados sensíveis digitados não são salvos nos servidores da nuvem. Qualquer rascunho é mantido estritamente na memória física desta máquina.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid de Modelos de Documentos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {DOCUMENT_MODELS.map(model => {
                        const Icon = model.icon;
                        return (
                            <Link
                                key={model.id}
                                href={model.href}
                                className="group relative bg-surface-100 hover:bg-surface-50 border border-surface-300 hover:border-primary-200/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-3 rounded-2xl border ${model.colorClass}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-200 text-typography-600 border border-surface-300">
                                            {model.category}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-typography-900 group-hover:text-primary-200 transition-colors">
                                            {model.title}
                                        </h2>
                                        <p className="text-xs font-medium text-primary-200 mt-0.5">
                                            {model.subtitle}
                                        </p>
                                        <p className="text-xs text-typography-600 mt-2.5 leading-relaxed line-clamp-3">
                                            {model.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-5 mt-4 border-t border-surface-200 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-typography-500">
                                        <HardDrive className="w-3 h-3 text-emerald-500" />
                                        Rascunho no aparelho
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-200 group-hover:translate-x-1 transition-transform">
                                        <span>Abrir modelo</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </ContentDashboard>
    );
}

ModelosHubPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"]);

export default ModelosHubPage;

