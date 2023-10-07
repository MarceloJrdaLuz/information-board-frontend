import { useAuthContext } from "@/context/AuthContext"

export default function FooterDashboard() {
    const { user } = useAuthContext()
    return (
        <footer className={`flex justify-between items-center w-full  h-16 bg-primary-100 shadow-md px-3 `}>
            <span className="bg-secondary-200 border border-gray-500 h-fit w-fit p-1">{user?.code}</span>
            <span></span>
        </footer>
    )
} 