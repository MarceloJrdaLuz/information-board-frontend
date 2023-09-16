import { IPermission } from "@/entities/types"
import { useEffect, useState } from "react"
import { useFetch } from "@/hooks/useFetch"
import Router from "next/router"
import { iconeEdit } from "@/assets/icons"


export default function ListPermissions() {
    const { data: getPermissions, mutate } = useFetch<IPermission[]>('/permission')
    const [permissions, setPermissions] = useState<IPermission[]>()

    useEffect(() => {
        setPermissions(getPermissions)
    }, [getPermissions])

    return (
        <>
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {permissions?.map(permission => (
                    <li className={`flex flex-col justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1`} key={permission.id}>
                        <div className="flex w-full justify-between items-center p-6 text-primary-200 font-semibold">
                            Nome da permissão:
                            <span className="font-normal">{permission.name}</span>
                        </div>
                        <div className="flex justify-between w-full p-6 font-semi-bold">
                            <div>
                                <span className="text-primary-200 font-semibold mr-2">Descrição:</span>
                                <span>{permission.description}</span>
                            </div>
                            <div className="flex pl-10 max-h-10">
                                <button onClick={() => Router.push(`/permissoes/edit/${permission.id}`)} className="flex items-center border border-gray-300 bg-white hover:bg-sky-100 p-3">{iconeEdit('#178582')} <span className="text-primary-200 font-semibold pl-1 ">Editar</span></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    )
}
