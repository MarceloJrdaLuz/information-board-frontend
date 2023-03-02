import { NavBarOptionsType } from "./types";


export default function NavBarOptions(props: NavBarOptionsType) {
    return (
        <li onClick={props.onClick} className={`relative flex flex-1 p-4 items-center cursor-pointer  hover:bg-secondary-100 hover:text-black  ${props.active && ' font-bold after:absolute after:right-0 after:content-[" "] after:w-0 after:h-0 after:border-t-[20px] after:border-t-transparent after:border-r-[30px] after:border-r-secondary-100 after:border-b-[20px] after:border-b-transparent'}`}>
            <span className="w-5 h-5 pr-7">
                {props.icon}
            </span>
            <span className="text-sm">{props.title}</span>
        </li>
    )
}