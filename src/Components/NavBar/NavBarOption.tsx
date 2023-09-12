import NavBarOptionIcon from "./NavBarOptionIcon"
import { NavBarOptionType } from "./types"

export default function NavBarOption(props: NavBarOptionType) {

    return (
        <li onClick={props.onClick} className={`relative flex flex-1 p-4 items-center cursor-pointer  hover:bg-secondary-100 hover:text-black  ${props.active && ' font-bold after:absolute after:right-0 after:content-[" "] after:w-0 after:h-0 after:border-t-[15px] lg:after:border-t-[20px] after:border-t-transparent after:border-r-[20px] lg:after:border-r-[30px] after:border-r-secondary-100 lg:after:border-b-[20px] after:border-b-[15px] after:border-b-transparent'}`} onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave}>
            <span className="pr-3 flex justify-center items-center">
               <NavBarOptionIcon icon={props.icon}/> 
            </span>
            <span className="text-xs lg:text-sm flex items-center max-w-[100px] lg:max-w-none">{props.title}</span>
        </li>
    )
}