interface FooterProps {
    ano: any
    nomeCongregacao: string
    aviso: string
}

export default function Footer(props: FooterProps) {
    return (
        <footer className={`
            flex flex-col items-center justify-center bg-primary-200 py-5
            `}>
            <span className="text-white text-"><strong>{props.ano} | {props.nomeCongregacao}</strong></span>

            <span className={`
                text-center text-black
                `}><strong>{props.aviso}</strong></span>
        </footer>
    )
}