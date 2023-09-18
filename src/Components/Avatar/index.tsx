import { AuthContext } from "@/context/AuthContext"
import Image from "next/image"
import { useContext } from "react"
import Dropdown from "../Dropdown"
import { IAvatar } from "./types"

export default function Avatar(props: IAvatar) {
    const { logout } = useContext(AuthContext)

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
                {props.url ? (
                    <Image src={'/images/designacoes.png'} fill alt="Foto de perfil"></Image>
                ) : (
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-300">ML</span>
                    </div>
                )
                }
            </div>
            <div>
                <Dropdown position="right"  handleClick={(option) => handleClick(option)} options={['Sair']} title={props.userName} />
            </div>
        </>
    )
}
