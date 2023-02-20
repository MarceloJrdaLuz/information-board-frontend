import NavBar from "../NavBar";
import { LayoutProps } from "./types";


export default function Layout(props: LayoutProps) {
    return (
        <>
            <main className={`flex w-screen h-screen`}>
                <NavBar pageActive={props.pageActive}/>
                {props.children}
            </main>
        </>
    )
}