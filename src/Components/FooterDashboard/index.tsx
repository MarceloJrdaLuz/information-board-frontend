import { AuthContext } from "@/context/AuthContext"
import { useContext } from "react"

export default function FooterDashboard() {
    const { user } = useContext(AuthContext)
    return (
        <footer className={`flex justify-between items-center w-full  h-16 bg-primary-100 shadow-md px-3 `}>
            <span className="bg-secondary-200 h-fit w-fit p-1">{user?.code}</span>
            <span></span>
        </footer>
    )
} 