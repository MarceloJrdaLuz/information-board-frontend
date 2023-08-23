import { ElementType } from "react"
interface NavBarOptionIconProps {
    icon: ElementType
}

export default function NavBarOptionIcon({ icon: Icon }: NavBarOptionIconProps) {
    return (
        <Icon />
    )
}