'use client'

import { isDesktopAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { useAtomValue } from "jotai"
import { Bell } from "lucide-react"
import Avatar from "../Avatar"
import AvatarCongregation from "../AvatarCongregation"
import ButtonHamburguer from "../ButtonHamburguer"
import { NotificationsModal } from "../NotificationsModal"

export default function HeaderDashboard() {
    const { user } = useAuthContext()
    const isDesktop = useAtomValue(isDesktopAtom)
    const { unreadCount, isModalOpen, setIsModalOpen } = usePushNotifications()

    return (
        <header
            className="sticky top-0 z-30 flex w-full items-center justify-between bg-gradient-to-r from-primary-200 via-primary-200 to-primary-150 px-3.5 sm:px-6 shadow-md border-b border-white/10"
            style={{
                paddingTop: 'env(safe-area-inset-top, 0px)',
                minHeight: 'calc(4.5rem + env(safe-area-inset-top, 0px))',
            }}
        >
            {/* Lado Esquerdo: Hambúrguer (mobile) + Congregação */}
            <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-0">
                {!isDesktop && <ButtonHamburguer />}
                <AvatarCongregation loading={!user} />
            </div>

            {/* Lado Direito: Sininho de Notificações + Avatar do Usuário */}
            <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-0">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white transition-all cursor-pointer shadow-2xs"
                    title="Notificações e Lembretes"
                >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-primary-200 animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                <Avatar
                    loading={!user}
                    userName={user?.fullName}
                    avatar_url={user?.profile?.avatar_url}
                    gender={user?.publisher?.gender}
                />
            </div>

            {/* Modal de Notificações e Controle Push */}
            <NotificationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </header>
    )
}