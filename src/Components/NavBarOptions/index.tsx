import { NavBarOptionsType } from "./types";


export default function NavBarOptions(props: NavBarOptionsType) {
    return (
        <li onClick={props.onClick} className={`flex flex-1 p-4 items-center cursor-pointer hover:bg-red-100 ${props.active && 'border-l-red-700 border-l-2 '}`}>
            <span className="w-5 h-5 pr-7">
                {props.icon}
            </span>
            <span className="text-sm">{props.title}</span>
        </li>
    )
}