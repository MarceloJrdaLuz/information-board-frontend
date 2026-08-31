'use client'

import { isDesktopAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { useAtomValue } from "jotai"
import Avatar from "../Avatar"
import AvatarCongregation from "../AvatarCongregation"
import ButtonHamburguer from "../ButtonHamburguer"

export default function HeaderDashboard() {
    const { user } = useAuthContext()
    const isDesktop = useAtomValue(isDesktopAtom)

    return (
        <header className="sticky top-0 z-30 flex w-full items-center justify-between h-18 sm:h-20 bg-gradient-to-r from-primary-200 via-primary-200 to-primary-150 px-3.5 sm:px-6 shadow-md border-b border-white/10">
            {/* Lado Esquerdo: Hambúrguer (mobile) + Congregação */}
            <div className="flex items-center gap-2 sm:gap-4">
                {!isDesktop && <ButtonHamburguer />}
                <AvatarCongregation loading={!user} />
            </div>

            {/* Lado Direito: Avatar do Usuário */}
            <div className="flex items-center gap-2 sm:gap-3">
                <Avatar
                    loading={!user}
                    userName={user?.fullName}
                    avatar_url={user?.profile?.avatar_url}
                    gender={user?.publisher?.gender}
                />
            </div>
        </header>
    )
}