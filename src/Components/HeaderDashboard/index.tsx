import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import Avatar from "../Avatar";
import { HeaderDashbordTypes } from "./types";
import Dropdown from "../Dropdown";
import { IconAddCongregation, IconCongregation } from "@/assets/icons";
import AvatarCongregation from "../AvatarCongregation";


export default function HeaderDashboard() {
    const { user } = useContext(AuthContext)

    const congregationUser = user?.congregation

    function handleClick(option: string) {

    }

    return (
        <header className={`flex justify-between items-center h-20 bg-primary-100 px-4 shadow-md`}>
            {/* <div className="flex justify-center items-center">
                {congregationUser && <Dropdown handleClick={(option) => handleClick(option)} options={['Atualizar informações da congregação']} title={`Congregação: ${congregationUser?.name} (${congregationUser?.number})`} />}
            </div> */}
            <div className="flex justify-center items-center">
                <AvatarCongregation />
            </div>
            <div className="flex justify-center items-center">
                <Avatar userName={user?.email} />
            </div>
        </header>
    )
}