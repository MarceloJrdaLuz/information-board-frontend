import { useEffect } from "react";
import InformationBoardImage from "../InformationBoardImage";

export interface INavBarLogoProps {
    isMenuOpen: boolean
}

export default function NavBarLogo({ isMenuOpen }: INavBarLogoProps) {
    return (
        <div className={` flex fixed top-0 bg-primary-200 ${isMenuOpen ? 'w-2/3 md:w-2/12 md:min-w-[185px] max-w-[300px]' : 'w-0 -left-20'} min-h-[80px] z-50 p-3 items-center justify-center border-b-2  `}>
            <span>
                <InformationBoardImage size="50" />
            </span>
        </div>
    )
}