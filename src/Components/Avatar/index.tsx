import { AuthContext } from "@/context/AuthContext";
import Image from "next/image";
import { useContext, useState } from "react";
import Dropdown from "../Dropdown";
import { IAvatar } from "./types";

export default function Avatar(props: IAvatar) {
    const { logout } = useContext(AuthContext)
    const [modalShow, setModalShow] = useState(false)

    function handleClick(option: string) {
        switch (option) {
            case "Sair":
                logout()
                break;

            default:
                break;
        }
    }

    return (
        <>
            <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
                {props.url ? (
                    <Image src={'/images/designacoes.png'} fill alt="Foto de perfil"></Image>
                ) : (

                    // <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-300">ML</span>
                    </div>
                )
                }
            </div>
            <Dropdown handleClick={(option) => handleClick(option)} options={['Sair', 'Profile']} title={props.userName} />
        </>
    )
}