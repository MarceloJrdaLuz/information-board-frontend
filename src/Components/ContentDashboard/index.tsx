import { ReactNode } from "react"
import FooterDashboard from "../FooterDashboard"
import HeaderDashboard from "../HeaderDashboard"
interface IContentDashboard {
    children: ReactNode
}


export default function ContentDashboard(props: IContentDashboard) {
    return (
<section className="flex flex-col flex-1 min-h-0 bg-secondary-100">
            <div className="shrink-0">
                <HeaderDashboard />
            </div>

            {/* ✅ somente aqui terá scroll */}
            <div className="flex-1 overflow-y-auto min-h-0 thin-scrollbar">
                {props.children}
            </div>

            <div className="shrink-0">
                <FooterDashboard />
            </div>
        </section>
    )
}
