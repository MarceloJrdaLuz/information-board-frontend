import NavBarOptionIcon from "./NavBarOptionIcon"
import { NavBarListOptionsType } from "./types"
import { ChevronDown } from 'lucide-react'

export default function NavBarListOptions({ children, title, icon, showList, onClick }: NavBarListOptionsType) {

    return (
        <div title={title} >
            <div onClick={onClick} className={`relative flex flex-1 p-4 items-center cursor-pointer  hover:bg-secondary-100 hover:text-black  `}>
                <span className="pr-3 flex justify-center items-center">
                    <NavBarOptionIcon icon={icon} />
                </span>
                <span className="text-xs lg:text-sm">{title}</span>
                {showList && <span className="flex ml-auto"><ChevronDown /></span>}
            </div>
            {showList && (
                <ul className="pl-2 ">
                    {children}
                </ul>
            )}
        </div>
    )
}