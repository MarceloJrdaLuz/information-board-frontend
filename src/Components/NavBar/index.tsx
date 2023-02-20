import { iconeAdd } from "@/assets/icons";
import NavBarOptions from "../NavBarOptions";
import Router from "next/router";
import { NavBarProps } from "./types";

export default function NavBar(props: NavBarProps) {

    return (
        <nav className={`w-2/12 bg-red-200 min-w-[200px]`}>
            <div className={`flex w-full p-10 items-center justify-center`}>
                <span>Icones</span>
            </div>
            <ul className={`w-full h-fit flex-1 `}>
                <NavBarOptions title="Início" icon={iconeAdd('#030303', 5, 5)} onClick={() => Router.push('/dashboard')} active={props.pageActive === 'dashboard' && true}/>
                <NavBarOptions title="Congregações" icon={iconeAdd('#ccc', 5, 5)} onClick={() => Router.push('/congregacoes')} active={props.pageActive === 'congregacoes' && true}/>
                <NavBarOptions title="Usuários" icon={iconeAdd('#ccc', 5, 5)} onClick={() => Router.push('/usuarios')} active={props.pageActive === 'usuarios' && true}/>
                <NavBarOptions title="Permissões" icon={iconeAdd('#fff', 5, 5)} onClick={() => Router.push('/permissoes')} active={props.pageActive === 'permissoes' && true}/>
                <NavBarOptions title="Categorias" icon={iconeAdd('#fff', 5, 5)} onClick={() => Router.push('/categorias')} active={props.pageActive === 'categorias' && true}/>
            </ul>
        </nav>
    )
}