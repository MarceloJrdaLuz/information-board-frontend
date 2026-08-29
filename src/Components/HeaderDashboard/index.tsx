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
        <header className={`flex w-full justify-between items-center h-20 bg-gradient-to-r from-primary-100 to-primary-150 px-4 shadow-md ${!isDesktop ? "pl-14" : "pl-0"}`}>
            {!isDesktop && <ButtonHamburguer />}
            <div className="flex w-full justify-between pl-3">
                <div className="flex justify-center items-center">
                    <AvatarCongregation loading={!user} />
                </div>
                <div className="flex justify-center items-center">
                    <Avatar
                        loading={!user}
                        userName={user?.fullName}
                        avatar_url={user?.profile?.avatar_url}
                        gender={user?.publisher?.gender}
                    />
                </div>
            </div>
        </header>
    )
}