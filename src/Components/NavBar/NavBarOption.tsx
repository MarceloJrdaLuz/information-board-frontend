import NavBarOptionIcon from "./NavBarOptionIcon"
import { NavBarOptionType } from "./types"

export default function NavBarOption(props: NavBarOptionType) {

    return (
        <li
            onClick={props.onClick}
            className={`relative flex items-center p-3 cursor-pointer 
    hover:bg-surface-200 hover:text-typography-900  
    ${props.active ? 'border-surface-100 font-semibold' : 'border-transparent'} ${props.isSubItem ? 'pl-8 border-l-8 ' : ''}`}
        >
            <span className="pr-3 flex justify-center items-center">
                <NavBarOptionIcon icon={props.icon} />
            </span>
            <span className="text-xs sm:text-sm  flex items-center max-w-[100px] lg:max-w-none">
                {props.title}
            </span>
        </li>

    )
}