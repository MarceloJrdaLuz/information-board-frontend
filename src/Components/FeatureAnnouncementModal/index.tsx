import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import {
    FEATURE_ANNOUNCEMENTS,
    IFeatureAnnouncement
} from "@/constants/featureAnnouncements";

interface FeatureAnnouncementModalProps {
    announcement?: IFeatureAnnouncement;
    forceOpen?: boolean;
    onClose?: () => void;
}

const STORAGE_KEY = "seen_feature_announcements";

export default function FeatureAnnouncementModal({
    announcement,
    forceOpen,
    onClose
}: FeatureAnnouncementModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeAnnouncement, setActiveAnnouncement] = useState<IFeatureAnnouncement | null>(null);

    const markAsSeen = (id: string) => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed: string[] = raw ? JSON.parse(raw) : [];
            if (!parsed.includes(id)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([...parsed, id]));
            }
        } catch (e) {
            console.error("Erro ao registrar visualização de novidade:", e);
        }
    };

    useEffect(() => {
        if (forceOpen && announcement) {
            setActiveAnnouncement(announcement);
            setIsOpen(true);
            return;
        }

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const seenIds: string[] = raw ? JSON.parse(raw) : [];

            // Se for passado um announcement específico
            if (announcement) {
                if (!seenIds.includes(announcement.id)) {
                    setActiveAnnouncement(announcement);
                    const timer = setTimeout(() => setIsOpen(true), 600);
                    return () => clearTimeout(timer);
                }
                return;
            }

            // Procura a primeira novidade ainda não visualizada
            const unread = FEATURE_ANNOUNCEMENTS.find((item) => !seenIds.includes(item.id));
            if (unread) {
                setActiveAnnouncement(unread);
                const timer = setTimeout(() => setIsOpen(true), 600);
                return () => clearTimeout(timer);
            }
        } catch (e) {
            console.error("Erro ao verificar novidades:", e);
        }
    }, [announcement, forceOpen]);

    const handleDismiss = () => {
        if (activeAnnouncement) {
            markAsSeen(activeAnnouncement.id);
        }
        setIsOpen(false);
        onClose?.();
    };

    const handleAction = () => {
        if (activeAnnouncement) {
            markAsSeen(activeAnnouncement.id);
            setIsOpen(false);
            onClose?.();
            if (activeAnnouncement.primaryAction?.link) {
                router.push(activeAnnouncement.primaryAction.link);
            }
        }
    };

    if (!activeAnnouncement) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
            <DialogContent className="max-w-xl w-[calc(100vw-24px)] sm:w-full bg-surface-100 border border-surface-300 p-5 sm:p-6 rounded-2xl max-h-[92dvh] overflow-y-auto thin-scrollbar shadow-2xl">
                <DialogHeader className="gap-2 text-left">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-200/10 border border-primary-200/20 text-primary-200 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={14} className="text-primary-200 animate-pulse" />
                            <span>{activeAnnouncement.badge || "Novidade no Sistema"}</span>
                        </span>
                    </div>

                    <DialogTitle className="text-lg sm:text-2xl font-extrabold text-typography-900 tracking-tight leading-tight">
                        {activeAnnouncement.title}
                    </DialogTitle>

                    <DialogDescription className="text-xs sm:text-sm text-typography-600 leading-relaxed">
                        {activeAnnouncement.subtitle}
                    </DialogDescription>
                </DialogHeader>

                {/* Lista de Recursos em Destaque */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                    {activeAnnouncement.items.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-surface-200/60 border border-surface-300/70 flex items-start gap-3 hover:border-primary-200/40 transition-colors"
                            >
                                <div className="p-2 rounded-xl bg-primary-200/10 text-primary-200 shrink-0 mt-0.5">
                                    <Icon size={18} />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <h4 className="text-xs font-bold text-typography-900 truncate">
                                        {item.title}
                                    </h4>
                                    <p className="text-[11px] text-typography-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Rodapé com Ações */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-3 border-t border-surface-300/70">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleDismiss}
                        className="w-full sm:w-auto text-xs text-typography-600 hover:text-typography-900 hover:bg-surface-200 h-9 px-4 rounded-xl cursor-pointer"
                    >
                        {activeAnnouncement.secondaryActionLabel || "Entendido"}
                    </Button>

                    <Button
                        type="button"
                        onClick={handleAction}
                        className="w-full sm:w-auto bg-primary-200 hover:bg-primary-150 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <span>{activeAnnouncement.primaryAction.label}</span>
                        <ArrowRight size={14} />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

