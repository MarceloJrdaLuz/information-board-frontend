import InformationBoardImage from "../InformationBoardImage"

export interface INavBarLogoProps {
    isMenuOpen: boolean
    isDesktop: boolean
}

export default function NavBarLogo({ isMenuOpen, isDesktop }: INavBarLogoProps) {
    return (
        <div
  className={`
    flex bg-primary-200
    min-h-[80px]
    z-50 p-3 items-center justify-center border-b-2
    overflow-hidden
    
    ${isDesktop ? 'w-full' : isMenuOpen ? 'w-full transition-all duration-200' : 'w-0 transition-all duration-200'}
  `}>
            <span>
                <InformationBoardImage size="40" />
            </span>
        </div>
    )
}