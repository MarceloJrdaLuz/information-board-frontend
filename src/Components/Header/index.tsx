import { ReactNode, useEffect, useState } from "react"

interface HeaderProps {
    className?: string
    children?: ReactNode
    texto?: string
}


export default function Header(props: HeaderProps) {

    const [largeHeight, setLargeHeight] = useState(false)

    useEffect(() => {
        if (window.innerHeight >= 600) setLargeHeight(true)
    }, [])

    return (
        <div className={`relative flex justify-center items-center h-[40vh]  w-full bg-gray-900`}>
            <header className={`flex h-full w-full max-w-[600px] lg:h-full md:h-full brightness-30 ${props.className}
            `}>
                {props.children}
            </header>
            <span className={`absolute text-3xl titulo text-white`}>{props.texto}</span>
        </div>
    )
}