import {
    isNotificationsModalOpenAtom,
    isPushSubscribedAtom,
    notificationsListAtom,
    pushLoadingAtom,
    pushPermissionAtom,
    unreadNotificationsCountAtom,
} from "@/atoms/pushAtoms"
import { API_ROUTES } from "@/constants/apiRoutes"
import { api } from "@/services/api"
import { isPushNotificationSupported, urlBase64ToUint8Array } from "@/utils/pushNotifications"
import { useAtom } from "jotai"
import { useCallback, useEffect } from "react"
import { toast } from "react-toastify"

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useAtom(isPushSubscribedAtom)
    const [permission, setPermission] = useAtom(pushPermissionAtom)
    const [loading, setLoading] = useAtom(pushLoadingAtom)
    const [notifications, setNotifications] = useAtom(notificationsListAtom)
    const [unreadCount, setUnreadCount] = useAtom(unreadNotificationsCountAtom)
    const [isModalOpen, setIsModalOpen] = useAtom(isNotificationsModalOpenAtom)

    const supported = isPushNotificationSupported()

    // Verifica status da inscrição local e remota
    const checkStatus = useCallback(async () => {
        if (!isPushNotificationSupported()) return

        setPermission(Notification.permission)

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                setIsSubscribed(true)
            } else {
                const response = await api.get(`${API_ROUTES.PUSH}/status`)
                setIsSubscribed(!!response.data?.isSubscribed)
            }
        } catch (error) {
            console.error("Erro ao verificar status push:", error)
        }
    }, [setIsSubscribed, setPermission])

    // Busca notificações recentes e contagem de não lidas
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get(`${API_ROUTES.NOTIFICATIONS}`)
            if (response.data) {
                setNotifications(response.data.notifications || [])
                setUnreadCount(response.data.unreadCount || 0)
            }
        } catch (error) {
            console.error("Erro ao buscar notificações:", error)
        }
    }, [setNotifications, setUnreadCount])

    // Inscreve o dispositivo para receber notificações push
    const subscribe = useCallback(async () => {
        if (!isPushNotificationSupported()) {
            toast.warn("Notificações push não são suportadas neste navegador.")
            return false
        }

        setLoading(true)
        try {
            // 1. Solicita permissão ao usuário
            const perm = await Notification.requestPermission()
            setPermission(perm)

            if (perm === "denied") {
                const isStandalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone)
                const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

                if (isStandalone || isMobile) {
                    toast.warn(
                        "Notificações bloqueadas no Android. Segure o ícone do aplicativo na tela inicial > 'Informações do App' (ℹ️) > 'Notificações' e ative 'Permitir notificações'.",
                        { autoClose: 9000 }
                    )
                } else {
                    toast.warn(
                        "As notificações estão bloqueadas no navegador. Clique no ícone ao lado da URL (cadeado/configurações) para permitir notificações neste site.",
                        { autoClose: 6000 }
                    )
                }
                setLoading(false)
                return false
            }

            if (perm !== "granted") {
                toast.warn("Permissão de notificação não foi concedida.")
                setLoading(false)
                return false
            }

            // 2. Garante que o Service Worker está registrado e pronto
            let registration = await navigator.serviceWorker.getRegistration()
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js')
            }
            registration = await navigator.serviceWorker.ready

            // 3. Obtém chave pública VAPID do backend (ou do env do frontend)
            let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

            if (!vapidPublicKey) {
                try {
                    const { data } = await api.get(`${API_ROUTES.PUSH}/public-key`)
                    vapidPublicKey = data?.publicKey
                } catch (err) {
                    console.error("Erro ao buscar chave pública do backend:", err)
                }
            }

            if (!vapidPublicKey) {
                throw new Error("Chave pública VAPID não configurada no servidor ou no frontend.")
            }

            // 4. Cria inscrição no PushManager do navegador
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
            let subscription = await registration.pushManager.getSubscription()

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                })
            }

            const subscriptionJson = subscription.toJSON()

            // 5. Envia para o backend salvar
            await api.post(`${API_ROUTES.PUSH}/subscribe`, {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscriptionJson.keys?.p256dh,
                    auth: subscriptionJson.keys?.auth,
                },
                userAgent: navigator.userAgent,
            })

            setIsSubscribed(true)
            toast.success("Notificações push ativadas com sucesso! 🎉")
            setLoading(false)
            return true
        } catch (error: any) {
            console.error("Erro ao registrar push subscription:", error)
            toast.error(error?.response?.data?.message || error?.message || "Erro ao ativar notificações.")
            setLoading(false)
            return false
        }
    }, [setIsSubscribed, setLoading, setPermission])

    // Remove a inscrição do dispositivo
    const unsubscribe = useCallback(async () => {
        if (!isPushNotificationSupported()) return

        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                await api.post(`${API_ROUTES.PUSH}/unsubscribe`, {
                    endpoint: subscription.endpoint,
                })
                await subscription.unsubscribe()
            }

            setIsSubscribed(false)
            toast.info("Notificações push desativadas.")
        } catch (error: any) {
            console.error("Erro ao desativar push:", error)
            toast.error("Erro ao desativar notificações.")
        } finally {
            setLoading(false)
        }
    }, [setIsSubscribed, setLoading])

    // Envia notificação de teste
    const sendTestNotification = useCallback(async () => {
        setLoading(true)
        try {
            // Dispara teste no backend
            const response = await api.post(`${API_ROUTES.PUSH}/test`)

            // Exibe notificação local direta via Service Worker para teste imediato
            if (Notification.permission === "granted") {
                const reg = await navigator.serviceWorker.ready
                if (reg && reg.showNotification) {
                    reg.showNotification("Notificações Ativadas! 🎉", {
                        body: "Você começará a receber suas designações e lembretes aqui.",
                        badge: "/icons/badge.png", // Usando o novo badge monocromático
                        data: { url: "/dashboard" },
                    })
                }
            }

            if (response.data?.sentCount === 0) {
                toast.info("Notificação gerada! Se não viu o banner do Windows, ative o interruptor para registrar seu dispositivo.", { autoClose: 5000 })
            } else {
                toast.success("Notificação de teste disparada! Verifique seu dispositivo.")
            }

            fetchNotifications()
        } catch (error: any) {
            console.error("Erro ao enviar teste de notificação:", error)
            toast.error("Erro ao disparar notificação de teste.")
        } finally {
            setLoading(false)
        }
    }, [fetchNotifications, setLoading])

    // Marca notificação específica como lida
    const markAsRead = useCallback(
        async (notificationId: string) => {
            try {
                await api.patch(`${API_ROUTES.NOTIFICATIONS}/${notificationId}/read`)
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
                )
                setUnreadCount((prev) => Math.max(0, prev - 1))
            } catch (error) {
                console.error("Erro ao marcar como lida:", error)
            }
        },
        [setNotifications, setUnreadCount]
    )

    // Marca todas as notificações como lidas
    const markAllAsRead = useCallback(async () => {
        try {
            await api.patch(`${API_ROUTES.NOTIFICATIONS}/read-all`)
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            )
            setUnreadCount(0)
            toast.success("Todas as notificações foram marcadas como lidas.")
        } catch (error) {
            console.error("Erro ao marcar todas como lidas:", error)
        }
    }, [setNotifications, setUnreadCount])

    useEffect(() => {
        if (supported) {
            checkStatus()
            fetchNotifications()
        }
    }, [checkStatus, fetchNotifications, supported])

    return {
        supported,
        isSubscribed,
        permission,
        loading,
        notifications,
        unreadCount,
        isModalOpen,
        setIsModalOpen,
        subscribe,
        unsubscribe,
        sendTestNotification,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        checkStatus,
    }
}
