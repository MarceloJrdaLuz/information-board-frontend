import { LucideIcon, Clock, CalendarDays, BookOpen, Send, Sparkles } from "lucide-react";

export interface IFeatureAnnouncementItem {
    icon: LucideIcon;
    title: string;
    description: string;
    badge?: string;
}

export interface IFeatureAnnouncement {
    id: string;
    badge?: string;
    title: string;
    subtitle: string;
    releaseDate?: string;
    items: IFeatureAnnouncementItem[];
    primaryAction: {
        label: string;
        link: string;
    };
    secondaryActionLabel?: string;
}

export const FEATURE_ANNOUNCEMENTS: IFeatureAnnouncement[] = [
    {
        id: "daily-ministry-v1",
        badge: "Nova Funcionalidade",
        title: "Minhas Atividades & Cronômetro de Campo",
        subtitle: "Agora você tem um espaço pessoal completo para acompanhar suas atividades de pregação e enviar seu relatório mensal com facilidade.",
        items: [
            {
                icon: Clock,
                title: "Cronômetro de Campo",
                description: "Cronometre suas horas no ministério com persistência em tempo real, mesmo se fechar o aplicativo."
            },
            {
                icon: CalendarDays,
                title: "Calendário e Diário Pessoal",
                description: "Visualize seus dias no ministério, registre horas e anote créditos de serviço aprovados."
            },
            {
                icon: BookOpen,
                title: "Estudantes Bíblicos",
                description: "Cadastre seus estudantes da Bíblia e vincule seus estudos dirigidos diretamente às suas atividades."
            },
            {
                icon: Send,
                title: "Envio Mensal Integrado",
                description: "Ao final do mês, transfira minutos restantes e envie seu relatório oficial diretamente para o secretário."
            }
        ],
        primaryAction: {
            label: "Conhecer Minhas Atividades",
            link: "/meus-relatorios/diario"
        },
        secondaryActionLabel: "Entendido"
    }
];
