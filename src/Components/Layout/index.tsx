import ContentDashboard from "../ContentDashboard";
import HeaderDashboard from "../HeaderDashboard";
import NavBar from "../NavBar";
import { LayoutProps } from "./types";




export default function Layout(props: LayoutProps) {
    return (
        <>
            <main className={`flex w-screen h-screen max-h-full`}>
                <NavBar pageActive={props.pageActive} />
                {props.children}
            </main>
        </>
    )
}