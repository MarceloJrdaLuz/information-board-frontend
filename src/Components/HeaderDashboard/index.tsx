import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import Avatar from "../Avatar";


export default function HeaderDashboard() {
    const { user } = useContext(AuthContext)

    return (
        <header className={`flex justify-between items-center h-20 bg-primary-100 px-4 shadow-md`}>
            <div>Dashboard</div>
            <div className="flex justify-center items-center">
                <Avatar userName={user?.email}/>
            </div>
        </header>
    )
}