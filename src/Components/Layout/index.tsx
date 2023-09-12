import Router, { useRouter } from "next/router"
import { NavBar } from "../NavBar"
import { LayoutProps } from "./types"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/context/AuthContext"
import { HomeIcon,  UsersIcon, ScreenShareIcon, SquareStackIcon,  CalendarDaysIcon, CalculatorIcon, MegaphoneIcon } from 'lucide-react'
import SalonIcon from "../Icons/SalonIcon"
import PreachingIcon from "../Icons/PreachingIcon"
import PrechingHomeIcon from "../Icons/PreachingHomeIcon"
import PublicPreachingIcon from "../Icons/PublicPreachingIcon"
import MeetingIcon from "../Icons/MeetingIcon"
import ReportIcon from "../Icons/ReportIcon"
import CleanIcon from "../Icons/CleanIcon"
import SecurityIcon from "../Icons/SecurityIcon"
import PublisherIcon from "../Icons/PublisherIcon"
import LifeAndMinistry from "../Icons/LifeAndMinistryIcon"
import PublicMeetingIcon from "../Icons/PublicMeetingIcon"
import { useAtom } from "jotai"
import { toogleMenu } from "@/atoms/atom"

export default function Layout(props: LayoutProps) {

    const router = useRouter()

    const { user: getUser, roleContains } = useContext(AuthContext)
    const [isHovering, setIsHovering] = useState(props.pageActive)
    const [user, setUser] = useState(getUser)
    const [showSubMenu, setShowSubMenu] = useState<string[]>([])
    const [isMenuOpen, setIsMenuOpen] = useAtom(toogleMenu)

    useEffect(() => {
        const path = router.pathname
        const parts = path.split('/') // Dividir a string usando a barra como separador
        const middlePart = parts[1] // Obter o elemento do meio (índice 1)   
        setShowSubMenu(prevState => [...prevState, middlePart])
    }, [router.pathname])

    useEffect(() => {
        setUser(getUser)
    }, [setUser, getUser])

    const isAdmin = roleContains('ADMIN')

    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')

    return (
        <main className={`flex w-screen h-screen max-h-full overflow-auto`}>
            <NavBar.Root>
                <NavBar.Logo />
                <NavBar.Options
                    title="Início"
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen)
                        Router.push('/dashboard')
                    }}
                    icon={HomeIcon}
                    active={props.pageActive === 'dashboard'}
                />

                {isAdmin &&
                    <NavBar.Options
                        title="Usuários"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/usuarios')
                        }}
                        icon={UsersIcon}
                        active={props.pageActive === 'usuarios'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Permissões"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/permissoes')
                        }}
                        icon={SecurityIcon}
                        active={props.pageActive === 'permissoes'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Domínio"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/add-domain')
                        }}
                        icon={ScreenShareIcon}
                        active={props.pageActive === 'add-domain'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Categorias"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/categorias')
                        }}
                        icon={SquareStackIcon}
                        active={props.pageActive === 'categorias'}
                    />
                }

                {isAdmin &&
                    <NavBar.Options
                        title="Congregações"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/congregacoes')
                        }}
                        icon={SalonIcon}
                        active={props.pageActive === 'congregacoes'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Publicadores"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/publicadores')
                        }}
                        icon={PublisherIcon}
                        active={props.pageActive === 'publicadores'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Relatórios"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push(`/relatorios/${user?.congregation.id}`)
                        }}
                        icon={ReportIcon}
                        active={props.pageActive === 'relatorios'}
                    />
                }
                
                {isAdminCongregation &&
                    <NavBar.Options
                        title="Anúncios"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/anuncios')
                        }}
                        icon={MegaphoneIcon}
                        active={props.pageActive === 'anuncios'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Limpeza"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/limpeza')
                        }}
                        icon={CleanIcon}
                        active={props.pageActive === 'limpeza'}
                    />
                }


                {isAdminCongregation &&
                    <NavBar.Options
                        title="Contas"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/contas')
                        }}
                        icon={CalculatorIcon}
                        active={props.pageActive === 'contas'}
                    />
                }

                {isAdminCongregation &&
                    <NavBar.Options
                        title="Eventos especiais"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                            Router.push('/eventosespeciais')
                        }}
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
                                setShowSubMenu(prevState => prevState.filter(item => item !== 'reunioes'))
                            } else {
                                setShowSubMenu(prevState => [...prevState, 'reunioes'])
                            }
                        }}
                        title="Reuniões" 
                        icon={MeetingIcon}
                    >
                        <NavBar.Options
                            title="Meio de semana"
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen)
                                Router.push(`/reunioes/meiodesemana`)
                            }}
                            icon={LifeAndMinistry}
                            active={props.pageActive === 'meiodesemana'}
                        />

                        <NavBar.Options
                            title="Fim de semana"
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen)
                                Router.push(`/reunioes/fimdesemana`)
                            }}
                            icon={PublicMeetingIcon}
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
                                setShowSubMenu(prevState => prevState.filter(item => item !== 'pregacao'))
                            } else {
                                setShowSubMenu(prevState => [...prevState, 'pregacao'])
                            }
                        }}
                        title="Pregação"
                        icon={PreachingIcon}
                    >
                        <NavBar.Options
                            title="Saídas de campo"
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen)
                                Router.push(`/pregacao/saidasdecampo`)
                            }}
                            icon={PrechingHomeIcon}
                            active={props.pageActive === 'saidasdecampo'}
                        />

                        <NavBar.Options
                            title="Testemunho público"
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen)
                                Router.push(`/pregacao/testemunhopublico`)
                            }}
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