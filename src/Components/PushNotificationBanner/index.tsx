import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellRing, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

export function PushNotificationBanner() {
    const { isSubscribed, isStatusChecked, loading, subscribe, supported, permission } = usePushNotifications();
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const dismissed = sessionStorage.getItem("dismissed_push_banner");
            if (dismissed === "true") {
                setIsDismissed(true);
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("dismissed_push_banner", "true");
        }
    };

    // Só exibe se a verificação inicial de status tiver concluído, for suportado, NÃO estiver inscrito, não tiver sido negado e não foi dispensado
    if (!isStatusChecked || !supported || isSubscribed || permission === "denied" || isDismissed) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-100/15 via-surface-100 to-surface-200 border border-primary-200/30 shadow-sm animate-fade-in relative overflow-hidden">
            {/* Botão fechar / dispensar */}
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-lg text-typography-400 hover:text-typography-700 hover:bg-surface-300/60 transition-colors"
                title="Dispensar por enquanto"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-6">
                <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-primary-200 text-white shrink-0 shadow-md shadow-primary-200/25">
                        <BellRing className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-typography-900 leading-tight">
                                Ativar lembretes no seu aparelho?
                            </h4>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-200/10 text-primary-200 text-[10px] font-semibold">
                                <Sparkles className="w-3 h-3" />
                                Recomendado
                            </span>
                        </div>
                        <p className="text-xs text-typography-600 mt-1 max-w-xl leading-relaxed">
                            Receba avisos automáticos sobre suas partes de reunião, saídas de campo e tarefas da congregação diretamente neste dispositivo.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="px-3.5 py-2 text-xs font-medium text-typography-600 hover:text-typography-900 hover:bg-surface-300/50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                    >
                        Agora não
                    </button>
                    <button
                        type="button"
                        onClick={() => subscribe()}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold rounded-xl bg-primary-200 hover:bg-primary-300 text-white transition-all shadow-md shadow-primary-200/25 active:scale-98 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                <span>Ativando...</span>
                            </>
                        ) : (
                            <>
                                <Bell className="w-3.5 h-3.5 shrink-0" />
                                <span>Ativar Notificações</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
export default PushNotificationBanner;

