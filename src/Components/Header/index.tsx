import { ReactNode } from "react"

interface HeaderProps {
    className?: string
    children?: ReactNode
    texto?: string
}

export default function Header(props: HeaderProps) {

    return (
        <div className="relative flex justify-center items-center h-1/2 lg:h-5/6 w-full bg-gray-900">
            <header className={`flex h-full w-full max-w-[600px] lg:h-full md:h-full brightness-30 ${props.className}
            `}>
                {props.children}
            </header>
                <span className={`absolute text-3xl titulo text-white`}>{props.texto}</span>
        </div>
    )
}