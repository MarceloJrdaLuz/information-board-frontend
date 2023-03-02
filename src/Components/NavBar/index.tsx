import { iconeAdd } from "@/assets/icons";
import NavBarOptions from "../NavBarOptions";
import Router from "next/router";
import { NavBarProps } from "./types";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function NavBar(props: NavBarProps) {
    const { user: getUser, roleContains } = useContext(AuthContext)

    const [user, setUser] = useState(getUser)
    
    const isAdmin = roleContains('ADMIN')

    return (
        <nav className={`w-2/12 bg-primary-200 min-w-[200px] text-white shadow-2xl`}>
            <div className={`flex w-full p-10 items-center justify-center`}>
                <span>Icones</span>
            </div>
            <ul className={`w-full h-fit flex-1 `}>
                <NavBarOptions title="Início" icon={iconeAdd('#030303', 5, 5)} onClick={() => Router.push('/dashboard')} active={props.pageActive === 'dashboard' && true} />
                {isAdmin && <NavBarOptions title="Congregações" icon={iconeAdd('#ccc', 5, 5)} onClick={() => Router.push('/congregacoes')} active={props.pageActive === 'congregacoes' && true} />}
                {isAdmin &&<NavBarOptions title="Usuários" icon={iconeAdd('#ccc', 5, 5)} onClick={() => Router.push('/usuarios')} active={props.pageActive === 'usuarios' && true} />}  
                {isAdmin &&<NavBarOptions title="Permissões" icon={iconeAdd('#fff', 5, 5)} onClick={() => Router.push('/permissoes')} active={props.pageActive === 'permissoes' && true} />}    
                {isAdmin &&<NavBarOptions title="Categorias" icon={iconeAdd('#fff', 5, 5)} onClick={() => Router.push('/categorias')} active={props.pageActive === 'categorias' && true} />}
            </ul>
        </nav>
    )
}