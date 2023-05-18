import { IconAddCongregation, IconCategory, IconCongregation, iconeAdd, IconHome, IconPermission } from "@/assets/icons";
import NavBarOptions from "../NavBarOptions";
import Router from "next/router";
import { NavBarProps } from "./types";
import { MouseEvent, MouseEventHandler, useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function NavBar(props: NavBarProps) {
    const { user: getUser, roleContains } = useContext(AuthContext)
    const [isHovering, setIsHovering] = useState(props.pageActive);
    const [user, setUser] = useState(getUser)

    const isAdmin = roleContains('ADMIN')

    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')

      return (
        <nav className={`w-2/12 bg-primary-200 min-w-[200px] text-white shadow-2xl`}>
            <div className={`flex w-full p-10 items-center justify-center`}>
                <span>Icones</span>
            </div>
            <ul className={`w-full h-fit flex-1 `}>
                <NavBarOptions onMouseEnter={() => setIsHovering('dashboard')} onMouseLeave={() => setIsHovering('')}   title="Início" icon={IconHome('22', isHovering === "dashboard" && true )} onClick={() => Router.push('/dashboard')} active={props.pageActive === 'dashboard' && true} />

                {isAdmin && <NavBarOptions onMouseEnter={() => setIsHovering('congregacoes')} onMouseLeave={() => setIsHovering('')} title="Congregações" icon={IconAddCongregation('22', isHovering === 'congregacoes' && true)} onClick={() => Router.push('/congregacoes')} active={props.pageActive === 'congregacoes' && true} />}

                {/* {isAdmin &&<NavBarOptions title="Usuários" icon={''} onClick={() => Router.push('/usuarios')} active={props.pageActive === 'usuarios' && true} />}   */}
                {isAdmin && <NavBarOptions onMouseEnter={() => setIsHovering('permissoes')} onMouseLeave={() => setIsHovering('')} title="Permissões" icon={IconPermission('25', isHovering === "permissoes" && true)} onClick={() => Router.push('/permissoes')} active={props.pageActive === 'permissoes' && true} />}
                
                {isAdmin && <NavBarOptions onMouseEnter={() => setIsHovering('categorias')} onMouseLeave={() => setIsHovering('')}  title="Categorias" icon={IconCategory('25', isHovering === 'categorias' && true)} onClick={() => Router.push('/categorias')} active={props.pageActive === 'categorias' && true} />}

                {isAdmin && <NavBarOptions onMouseEnter={() => setIsHovering('add-domain')} onMouseLeave={() => setIsHovering('')}  title="Domínio" icon={IconCongregation('25', isHovering === 'add-domain' && true)} onClick={() => Router.push('/add-domain')} active={props.pageActive === 'add-domain' && true} />}
                
                {isAdminCongregation && <NavBarOptions onMouseEnter={() => setIsHovering('publicadores')} onMouseLeave={() => setIsHovering('')}  title="Publicadores" icon={IconCongregation('25', isHovering === 'publicadores' && true)} onClick={() => Router.push('/publicadores')} active={props.pageActive === 'publicadores' && true} />}
            </ul>
        </nav>
    )
}