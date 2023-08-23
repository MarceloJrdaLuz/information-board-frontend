import Image from "next/image"
import { useContext } from "react"
import Dropdown from "../Dropdown"
import Router from "next/router"
import { CongregationContext } from "@/context/CongregationContext"

export default function AvatarCongregation() {
    const { congregation: congregationUser } = useContext(CongregationContext)

    function handleClick(option: string) {
        switch (option) {
            case "Informações da congregação":
                const targetRoute = 'congregacao/informacoes'

                // Check if the current route is the target route
                if (Router.asPath !== `/${targetRoute}`) {
                    Router.push(`/${targetRoute}`)
                }
                
                break

            default:
                break
        }
    }

    return (
        <>
            <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 mr-2">
                {congregationUser?.image_url ? (
                    <Image src={congregationUser?.image_url} fill sizes="33vw" alt="Foto da congregação"></Image>
                ) : (

                    // <svg className="absolute w-12 h-12 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-300">{congregationUser?.name?.slice(0, 1)}</span>
                    </div>
                )
                }
            </div>
            {congregationUser && <Dropdown handleClick={(option) => handleClick(option)} options={['Informações da congregação']} title={`Congregação: ${congregationUser?.name} (${congregationUser?.number})`} />}
        </>
    )
}