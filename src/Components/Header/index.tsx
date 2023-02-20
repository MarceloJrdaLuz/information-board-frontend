
interface HeaderProps {
    className?: string
    children?: any
    texto?: string
}

export default function Header(props: HeaderProps) {

    return (
        <div className="relative flex justify-center items-center h-1/2 lg:h-5/6 w-full ">
            <header className={`flex  h-full w-full lg:h-full md:h-full brightness-30 ${props.className}
            `}>
            </header>
                <span className={`absolute text-3xl titulo text-white`}>{props.texto}</span>
        </div>
    )
}