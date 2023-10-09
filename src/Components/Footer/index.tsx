import Link from "next/link"
import InformationBoardIcon from "../Icons/InformationBoardIcon"

interface FooterProps {
    ano: any
    nomeCongregacao: string
    aviso: string
}

export default function Footer(props: FooterProps) {
    return (
        <footer className={`
            flex flex-col items-center justify-center bg-primary-200 py-5
            text-sm sm:text-base md:text-lg
            `}>
            <div className="flex justify-center w-full relative">
                <span className="text-white justify-items-end mr-2"><strong>{props.ano} | {props.nomeCongregacao}</strong></span>
            </div>
            <span className={`
                text-center text-black
                `}><strong>{props.aviso}</strong>
            </span>
            <Link className="w-full ml-3" href={'/login'}>
                <span className="flex  justify-center items-end ">
                    <InformationBoardIcon />
                    <span className="ml-1 text-white text-xs">Login</span>
                </span>
            </Link>
        </footer>
    )
}