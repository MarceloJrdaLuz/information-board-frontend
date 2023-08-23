import { ICongregation } from "@/entities/types"
import Image from "next/image"

export default function CardCongregation(props: ICongregation){
    return(
        <li className={'flex flex-col cursor-pointer hover:scale-105 bg-transparent shadow-lg rounded-xl m-3  justify-center text-sm items-start w-60 h-fit'} key={props.number}>
                        <div className="flex justify-center items-center h-28 w-full">
                            {props.image_url !== '' ? ( 
                                <Image className="rounded-t-lg w-full object-cover h-full" src={props.image_url ?? ""} alt={'Foto salao'} width={500} height={500}></Image>
                            ) : (
                                <div className="w-full h-full flex justify-center items-center bg-[#121313b4]  rounded-t-lg ">
                                    <span>Sem Foto</span>
                                </div>
                            )}
                        </div>
                        <div className="p-2 ">
                            <span className="p-2 ">
                                <span className="font-semibold mr-2">
                                    Congregação:
                                </span>
                                {props.name}
                            </span>
                        </div>
                        <div className="p-2">
                            <span className="p-2">
                                <span className="font-semibold">Cidade: </span>
                                {props.city}
                            </span>
                        </div>
                        <div className="p-2">
                            <span className="p-2">
                                <span className="font-semibold">Circuito: </span>
                                {props.circuit}
                            </span>
                            <span className="p-2">
                                <span className="font-semibold">Nº: </span>
                                {props.number}
                            </span>
                        </div>
                    </li>
    )
}