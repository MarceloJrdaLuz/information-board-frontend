import NavBarOptionIcon from "./NavBarOptionIcon"
import { NavBarOptionType } from "./types"

export default function NavBarOption(props: NavBarOptionType) {

    return (
        <li
            onClick={props.onClick}
            className={`relative flex items-center p-4 cursor-pointer 
    hover:bg-surface-200 hover:text-typography-900 
    ${props.active ? 'border-r-8 border-primary-500 bg-secondary-50 font-semibold' : ''}`}
        >
            <span className="pr-3 flex justify-center items-center">
                <NavBarOptionIcon icon={props.icon} />
            </span>
            <span className="text-xs lg:text-sm flex items-center max-w-[100px] lg:max-w-none">
                {props.title}
            </span>
        </li>

    )
}