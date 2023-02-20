import { ButtonHTMLAttributes } from "react"

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    color?: string
    hoverColor?: string
}

export default function Button(props: BotaoProps){
    return(
        <button onClick={props.onClick} className={`w-fit py-[5%] px-[15%] sm:px-9 rounded-lg ${props.color ? `${props.color}` : 'bg-button-default'} ${props.hoverColor ? `hover:${props.hoverColor}` : 'hover:bg-button-hover'}  hover:text-white ${props.disabled && 'bg-button-disabled hover:bg-button-disabled cursor-not-allowed'}`} disabled={props.disabled}>{props.title}</button>
    )
}