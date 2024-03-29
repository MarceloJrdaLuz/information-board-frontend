import { ReactNode } from "react"
import FooterDashboard from "../FooterDashboard"
import HeaderDashboard from "../HeaderDashboard"
interface IContentDashboard {
    children: ReactNode
}


export default function ContentDashboard(props: IContentDashboard) {
    return (
        <section className={`flex flex-col w-[75%] flex-1 justify-between max-h-screen  bg-secondary-100`}>
            <div >
                <HeaderDashboard />
            </div>
            <div className="overflow-y-auto  flex-1 thin-scrollbar">
                {props.children}
            </div>
            <div>
                <FooterDashboard />
            </div>
        </section>
    )
}