import { useAuthContext } from "@/context/AuthContext"
import Image from "next/image"
import Dropdown from "../Dropdown"
import { IAvatar } from "./types"
import { getInitials } from "@/functions/getInitials"
import SkeletonAvatar from "./skeletonAvatar"

export default function Avatar(props: IAvatar) {
    const { logout } = useAuthContext()

    function handleClick(option: string) {
        switch (option) {
            case "Sair":
                logout()
                break

            default:
                break
        }
    }

    return (
        <>
            <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
                {props.loading ? (
                    <SkeletonAvatar />
                ) : props.avatar_url ? (
                    <Image style={{ objectFit: "cover", objectPosition: "top center" }} src={props.avatar_url} fill alt="Foto de perfil"></Image>
                ) : (
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-300">{getInitials(props.userName ?? "")}</span>
                    </div>
                )
                }
            </div>
            <div>
                <Dropdown position="right" handleClick={(option) => handleClick(option)} options={['Sair']} title={props.userName} />
            </div>
        </>
    )
}
