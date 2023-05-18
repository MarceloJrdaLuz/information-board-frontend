import { ReactNode } from "react";
import FooterDashboard from "../FooterDashboard";
import HeaderDashboard from "../HeaderDashboard";
interface IContentDashboard {
    children: ReactNode
}


export default function ContentDashboard(props: IContentDashboard) {
    return (
        <section className={`flex flex-col flex-1 justify-between max-h-screen bg-secondary-100`}>
            <div>
                <HeaderDashboard />
            </div>
            <div className="overflow-auto flex-1">
                {props.children}
            </div>
            <div>
                <FooterDashboard />
            </div>
        </section>
    )
}