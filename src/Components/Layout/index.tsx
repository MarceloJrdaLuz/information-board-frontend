import Router, { useRouter } from "next/router";
import { NavBar } from "../NavBar";
import { LayoutProps } from "./types";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext"
import { HomeIcon, Users2Icon, ScrollTextIcon, UsersIcon, Key, ScreenShareIcon, SquareStackIcon, School2, User2Icon, CalendarIcon, CalendarDaysIcon, CalculatorIcon } from 'lucide-react'
import { PregacaoIcon } from "@/assets/icons";
import SvgIcon from "../SvgIcon";
import SalonIcon from "../Icons/SalonIcon";
import PregationIcon from "../Icons/PreachingIcon";
import PreachingIcon from "../Icons/PreachingIcon";
import PrechingHomeIcon from "../Icons/PreachingHomeIcon";
import PublicPreachingIcon from "../Icons/PublicPreaching";
import MeetingIcon from "../Icons/MeetingIcon";
import ReportIcon from "../Icons/ReportIcon";
import CleanIcon from "../Icons/CleanIcon";
import SecurityIcon from "../Icons/SecurityIcon";

export default function Layout(props: LayoutProps) {

    const router = useRouter()

    const { user: getUser, roleContains } = useContext(AuthContext)
    const [isHovering, setIsHovering] = useState(props.pageActive)
    const [user, setUser] = useState(getUser)
    const [showSubMenu, setShowSubMenu] = useState<string[]>([])

    useEffect(() => {
        const path = router.pathname
        const parts = path.split('/'); // Dividir a string usando a barra como separador
        const middlePart = parts[1]; // Obter o elemento do meio (índice 1)   
        setShowSubMenu(prevState => [...prevState, middlePart])
    }, [router.pathname])

    useEffect(() => {
        setUser(getUser)
    }, [setUser, getUser])

    const isAdmin = roleContains('ADMIN')

    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')

    return (
        <main className={`flex w-screen h-screen max-h-full`}>

            <NavBar.Root>
                <NavBar.Logo />
                <NavBar.Options
                    title="Início"
                    onClick={() => Router.push('/dashboard')}
                    icon={HomeIcon}
                    active={props.pageActive === 'dashboard'}
                />

                {isAdmin &&
                    <NavBar.Options
                        title="Usuários"
                        onClick={() => Router.push('/usuarios')}
                        icon={UsersIcon}
                        active={props.pageActive === 'usuarios'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Permissões"
                        onClick={() => Router.push('/permissoes')}
                        icon={SecurityIcon}
                        active={props.pageActive === 'permissoes'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Domínio"
                        onClick={() => Router.push('/add-domain')}
                        icon={ScreenShareIcon}
                        active={props.pageActive === 'add-domain'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Categorias"
                        onClick={() => Router.push('/categorias')}
                        icon={SquareStackIcon}
                        active={props.pageActive === 'categorias'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Congregações"
                        onClick={() => Router.push('/congregacoes')}
                        icon={SalonIcon}
                        active={props.pageActive === 'congregacoes'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Publicadores"
                        onClick={() => Router.push('/publicadores')}
                        icon={Users2Icon}
                        active={props.pageActive === 'publicadores'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Relatórios"
                        onClick={() => Router.push(`/relatorios/${user?.congregation.id}`)}
                        icon={ReportIcon}
                        active={props.pageActive === 'relatorios'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Limpeza"
                        onClick={() => Router.push('/limpeza')}
                        icon={CleanIcon}
                        active={props.pageActive === 'limpeza'}
                    />
                }


                {isAdminCongregation &&
                    <NavBar.Options
                        title="Contas"
                        onClick={() => Router.push(`/contas`)}
                        icon={CalculatorIcon}
                        active={props.pageActive === 'contas'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Eventos especiais"
                        onClick={() => Router.push(`/eventosespeciais`)}
                        icon={CalendarDaysIcon}
                        active={props.pageActive === 'eventosespeciais'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.ListOptions
                        key={"submenuReunioes"}
                        showList={showSubMenu.includes('reunioes')}
                        onClick={() => {
                            if (showSubMenu.includes('reunioes')) {
                                setShowSubMenu(prevState => prevState.filter(item => item !== 'reunioes'));
                            } else {
                                setShowSubMenu(prevState => [...prevState, 'reunioes']);
                            }
                        }}
                        title="Reuniões" 
                        icon={MeetingIcon}
                    >
                        <NavBar.Options
                            title="Meio de semana"
                            onClick={() => Router.push(`/reunioes/meiodesemana`)}
                            icon={MeetingIcon}
                            active={props.pageActive === 'meiodesemana'}
                        />

                        <NavBar.Options
                            title="Fim de semana"
                            onClick={() => Router.push(`/reunioes/fimdesemana`)}
                            icon={MeetingIcon}
                            active={props.pageActive === 'fimdesemana'}
                        />
                    </NavBar.ListOptions>
                }

                {isAdminCongregation &&
                    <NavBar.ListOptions
                        key={"submenuPregacao"}
                        showList={showSubMenu.includes('pregacao')}
                        onClick={() => {
                            if (showSubMenu.includes('pregacao')) {
                                setShowSubMenu(prevState => prevState.filter(item => item !== 'pregacao'));
                            } else {
                                setShowSubMenu(prevState => [...prevState, 'pregacao']);
                            }
                        }}
                        title="Pregação"
                        icon={PreachingIcon}
                    >
                        <NavBar.Options
                            title="Saídas de campo"
                            onClick={() => Router.push(`/pregacao/saidasdecampo`)}
                            icon={PrechingHomeIcon}
                            active={props.pageActive === 'saidasdecampo'}
                        />

                        <NavBar.Options
                            title="Testemunho público"
                            onClick={() => Router.push(`/pregacao/testemunhopublico`)}
                            icon={PublicPreachingIcon}
                            active={props.pageActive === 'testemunhopublico'}
                        />
                    </NavBar.ListOptions>
                }

            </NavBar.Root>
            {props.children}
        </main>
    )
}