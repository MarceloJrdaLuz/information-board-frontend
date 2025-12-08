import { ComponentProps } from "react"
import { useAtom } from 'jotai'
import { toogleMenu } from "@/atoms/atom"

interface ButtonHamburguerProps extends ComponentProps<'button'> {

}


export default function ButtonHamburguer({ onClick }: ButtonHamburguerProps) {
    const [toogleMenuValue, setToogleMenuValue] = useAtom(toogleMenu)

    const toggleValue = () => {
        setToogleMenuValue(!toogleMenuValue)
    }
    
    return (
        <button onClick={toggleValue} className={`md:hidden fixed top-4 left-4 z-50 transition-all`}>
            <div className=" relative flex overflow-hidden items-center justify-center rounded-full w-[50px] h-[50px] transform transition-all ring-0 ring-typography-300 duration-200 text-typography-200">
                <div className="flex flex-col justify-between w-[20px] h-[20px] transform transition-all duration-500 origin-center overflow-hidden">
                    <div className={`bg-current h-[2px] w-7 transform transition-all duration-500 ${toogleMenuValue ? '-rotate-45 -translate-x-1' : 'rotate-0'}`}></div>
                    <div className="bg-current h-[2px] w-7 rounded transform transition-all duration-500 "></div>
                    <div className={`bg-current h-[2px] w-7 transform transition-all duration-500 ${toogleMenuValue ? 'rotate-45 -translate-x-1' : 'rotate-0'}`}></div>
                </div>
            </div>
        </button>  
    )
}