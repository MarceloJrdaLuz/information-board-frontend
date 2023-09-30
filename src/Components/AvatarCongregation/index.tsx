import Image from "next/image"
import Dropdown from "../Dropdown"
import Router from "next/router"
import { useCongregationContext } from "@/context/CongregationContext"

export default function AvatarCongregation() {
    const { congregation: congregationUser } = useCongregationContext()

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
            <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 ">
                {congregationUser?.image_url ? (
                    <Image src={congregationUser?.image_url} fill sizes="33vw" alt="Foto da congregação"></Image>
                ) : (
                    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                        <span className="font-medium text-gray-600 dark:text-gray-300">{congregationUser?.name?.slice(0, 1)}</span>
                    </div>
                )
                }
            </div>
            <div >   
                {congregationUser &&
                    <Dropdown  handleClick={(option) => handleClick(option)} options={['Informações da congregação']} title={`Congregação: ${congregationUser?.name} (${congregationUser?.number})`}
                    />
                }
            </div>
        </>
    )
}