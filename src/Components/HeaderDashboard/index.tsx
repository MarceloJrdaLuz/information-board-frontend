import { useAuthContext } from "@/context/AuthContext"
import Avatar from "../Avatar"
import AvatarCongregation from "../AvatarCongregation"
import ButtonHamburguer from "../ButtonHamburguer"


export default function HeaderDashboard() {
    const { user } = useAuthContext()

    return (
        <header className={`flex w-full justify-between items-center h-20 bg-primary-100 px-4 shadow-md`}>
            <ButtonHamburguer />
            <div className="flex w-full justify-between pl-3">
                <div className="flex justify-center items-center">
                    <AvatarCongregation loading={!user} />
                </div>
                <div className="flex justify-center items-center">
                    <Avatar loading={!user} userName={user?.fullName} avatar_url={user?.profile?.avatar_url} />
                </div>
            </div>
        </header>
    )
}