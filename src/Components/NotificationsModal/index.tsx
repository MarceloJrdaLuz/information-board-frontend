import { usePushNotifications } from "@/hooks/usePushNotifications"
import { INotification, NotificationType } from "@/types/notification"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import relativeTime from "dayjs/plugin/relativeTime"
import {
    Bell,
    BellOff,
    BellRing,
    BookOpen,
    CheckCheck,
    Heart,
    MapPin,
    Mic,
    Send,
    Sparkles,
    Users,
    X
} from "lucide-react"
import Router from "next/router"
import { Switch } from "../ui/switch"

dayjs.extend(relativeTime)
dayjs.locale("pt-br")

interface Props {
    isOpen: boolean
    onClose: () => void
}

export function NotificationsModal({ isOpen, onClose }: Props) {
    const {
        isSubscribed,
        loading,
        notifications,
        unreadCount,
        subscribe,
        unsubscribe,
        sendTestNotification,
        markAsRead,
        markAllAsRead,
        supported,
    } = usePushNotifications()

    if (!isOpen) return null

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.CHAIRMAN:
            case NotificationType.READING:
                return <BookOpen className="w-4 h-4 text-amber-500" />
            case NotificationType.SPEAKER:
                return <Mic className="w-4 h-4 text-blue-500" />
            case NotificationType.CLEANING:
                return <Sparkles className="w-4 h-4 text-green-500" />
            case NotificationType.FIELD_SERVICE:
                return <MapPin className="w-4 h-4 text-orange-500" />
            case NotificationType.PUBLICWITNESS:
                return <Users className="w-4 h-4 text-sky-500" />
            case NotificationType.HOSPITALITY:
                return <Heart className="w-4 h-4 text-rose-500" />
            case NotificationType.REMINDER:
            default:
                return <Bell className="w-4 h-4 text-primary-200" />
        }
    }

    const handleClickNotification = async (notification: INotification) => {
        if (!notification.read_at) {
            await markAsRead(notification.id)
        }
        if (notification.data?.url) {
            onClose()
            Router.push(notification.data.url)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-100 border border-surface-300 w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-surface-300 bg-surface-200/40">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-100/10 text-primary-200 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-typography-700">Central de Notificações</h2>
                            <p className="text-xs text-typography-500">
                                {unreadCount > 0
                                    ? `${unreadCount} ${unreadCount === 1 ? "não lida" : "não lidas"}`
                                    : "Todas as notificações lidas"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                title="Marcar todas como lidas"
                                className="flex items-center gap-1 text-xs text-primary-200 hover:text-primary-300 font-medium px-2 py-1 rounded-md hover:bg-surface-300/40 transition"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Marcar lidas</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-typography-400 hover:text-typography-600 p-1.5 rounded-lg hover:bg-surface-300/50 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Banner de Push Subscription */}
                <div className="p-3 bg-surface-200/30 border-b border-surface-300">
                    <div className="flex items-center justify-between gap-3 bg-surface-100 p-3 rounded-lg border border-surface-300">
                        <div className="flex items-center gap-2.5">
                            {isSubscribed ? (
                                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-full">
                                    <BellRing className="w-4 h-4" />
                                </div>
                            ) : (
                                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-full">
                                    <BellOff className="w-4 h-4" />
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold text-typography-700">
                                    {isSubscribed ? "Notificações push ativas" : "Ativar notificações no dispositivo"}
                                </p>
                                <p className="text-[11px] text-typography-500">
                                    {isSubscribed
                                        ? "Recebendo lembretes e designações"
                                        : "Receba alertas mesmo com o app fechado"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isSubscribed && (
                                <button
                                    onClick={sendTestNotification}
                                    disabled={loading}
                                    title="Enviar notificação de teste"
                                    className="flex items-center gap-1 text-xs bg-surface-200 text-typography-600 px-2.5 py-1 rounded-md hover:bg-surface-300 transition"
                                >
                                    <Send className="w-3 h-3" />
                                    <span className="hidden sm:inline">Testar</span>
                                </button>
                            )}

                            <Switch
                                className="
    data-[state=checked]:bg-[rgb(var(--color-primary-100))]
    [&>span]:data-[state=checked]:bg-[rgb(var(--color-primary-200))]
  "
                                checked={isSubscribed}
                                onCheckedChange={(checked) => {
                                    if (checked) subscribe()
                                    else unsubscribe()
                                }}
                                disabled={loading || !supported}
                            />
                        </div>
                    </div>
                </div>

                {/* Lista de Notificações */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-surface-200">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="p-3 bg-surface-200 rounded-full text-typography-400 mb-2">
                                <Bell className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-typography-700">Nenhuma notificação por aqui</p>
                            <p className="text-xs text-typography-500 max-w-xs mt-0.5">
                                Quando você tiver novas designações ou lembretes pessoais, eles aparecerão aqui.
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const isUnread = !n.read_at
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleClickNotification(n)}
                                    className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition pt-3 ${isUnread
                                            ? "bg-primary-100/5 hover:bg-primary-100/10 border-l-4 border-primary-200"
                                            : "hover:bg-surface-200/40"
                                        }`}
                                >
                                    <div className="p-2 bg-surface-200 rounded-lg shrink-0 mt-0.5">
                                        {getNotificationIcon(n.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p
                                                className={`text-xs truncate ${isUnread ? "font-bold text-typography-800" : "font-medium text-typography-700"
                                                    }`}
                                            >
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-typography-400 shrink-0">
                                                {dayjs(n.created_at).fromNow()}
                                            </span>
                                        </div>

                                        <p className="text-xs text-typography-600 mt-0.5 line-clamp-2 leading-relaxed">
                                            {n.body}
                                        </p>
                                    </div>

                                    {isUnread && (
                                        <span className="w-2 h-2 rounded-full bg-primary-200 shrink-0 mt-1.5" />
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
