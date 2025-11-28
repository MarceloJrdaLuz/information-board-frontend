import { isDesktopAtom, openSubMenuAtom, pageActiveAtom, toogleMenu } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { useAtom, useAtomValue } from "jotai"
import { CalculatorIcon, CalendarDaysIcon, ClipboardList, FileSpreadsheetIcon, FileTextIcon, FunctionSquareIcon, HomeIcon, KanbanSquareIcon, LineChart, SquareStackIcon, UsersIcon, UtensilsIcon } from 'lucide-react'
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import CalendarMicIcon from "../Icons/CalendarMicIcon"
import CleanIcon from "../Icons/CleanIcon"
import ExternalTalkIcon from "../Icons/ExternalTalkIcon"
import GroupIcon from "../Icons/GroupIcon"
import LifeAndMinistry from "../Icons/LifeAndMinistryIcon"
import MeetingIcon from "../Icons/MeetingIcon"
import MyReportsIcon from "../Icons/MyReportsIcon"
import NoticesIcon from "../Icons/NoticesIcon"
import EmergencyContactIcon from "../Icons/PhoneContactIcon"
import PrechingHomeIcon from "../Icons/PreachingHomeIcon"
import PreachingIcon from "../Icons/PreachingIcon"
import PublicMeetingIcon from "../Icons/PublicMeetingIcon"
import PublicPreachingIcon from "../Icons/PublicPreachingIcon"
import PublisherIcon from "../Icons/PublisherIcon"
import PuzzleIcon from "../Icons/PuzzleIcon"
import ReportIcon from "../Icons/ReportIcon"
import SalonIcon from "../Icons/SalonIcon"
import SecurityIcon from "../Icons/SecurityIcon"
import SpeakerIcon from "../Icons/SpeakerIcon"
import TalkIcon from "../Icons/TalksIcon"
import TerritoryIcon from "../Icons/TerritoryIcon"
import { NavBar } from "../NavBar"
import { ConsentCongregationWrapper } from "../wrappers/ConsentCongregationWrapper"
import { LayoutProps } from "./types"

export default function Layout(props: LayoutProps) {

    const router = useRouter()

    const { authResolved, user, roleContains } = useAuthContext()
    const [isMenuOpen, setIsMenuOpen] = useAtom(toogleMenu)
    const [openSubMenu, setOpenSubMenu] = useAtom(openSubMenuAtom)
    const isDesktop = useAtomValue(isDesktopAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        if (authResolved) {
            const timeout = setTimeout(() => setShowMenu(true), 700); // 50ms ou 100ms
            return () => clearTimeout(timeout);
        }
    }, [authResolved]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageActive(router.pathname)
        }
    }, [router.pathname, setPageActive])

    useEffect(() => {
        const path = router.pathname
        const parts = path.split('/')
        const middlePart = parts[1]

        setOpenSubMenu(middlePart) // Define o submenu ativo baseado na URL
    }, [router.pathname, setOpenSubMenu])

    const toggleSubMenu = (menuKey: string) => {
        setOpenSubMenu((prev) => (prev === menuKey ? null : menuKey))
    }

    const isAdmin = roleContains('ADMIN')

    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')

    return (
        <main className={`flex w-screen h-screen max-h-full overflow-y-auto`}>
            <NavBar.Root>
                {!showMenu && <NavBar.Skeleton items={5} />}
                <div className={`transition-opacity duration-150 ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* <NavBar.Logo /> */}
                    <NavBar.Options
                        title="Início"
                        onClick={() => {
                            { !isDesktop && setIsMenuOpen(false) }
                            Router.push('/dashboard')
                        }}
                        icon={() => <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                        active={pageActive === '/dashboard'}
                    />

                    <ConsentCongregationWrapper>
                        <NavBar.Options
                            title="Meus relatórios"
                            onClick={() => {
                                { !isDesktop && setIsMenuOpen(false) }
                                Router.push('/meus-relatorios')
                            }}
                            icon={() => <MyReportsIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            active={pageActive === '/meus-relatorios'}
                        />

                        {(isAdminCongregation ||
                            roleContains('PUBLISHERS_MANAGER') ||
                            roleContains('PUBLISHERS_VIEWER') ||
                            roleContains('GROUPS_VIEWER') ||
                            roleContains('GROUPS_MANAGER') ||
                            roleContains('PUBLISHERS_VIEWER') ||
                            roleContains('REPORTS_VIEWER') ||
                            roleContains('REPORTS_MANAGER') ||
                            roleContains('TERRITORIES_MANAGER') ||
                            roleContains('ASSISTANCE_MANAGER') ||
                            roleContains('ASSISTANCE_VIEWER') ||
                            roleContains('TERRITORIES_VIEWER') ||
                            roleContains('TALK_MANAGER')) &&
                            <NavBar.ListOptions
                                key={"submenuCongregação"}
                                showList={openSubMenu === 'congregacao'}
                                onClick={() => toggleSubMenu('congregacao')}
                                title="Congregação"
                                icon={() => <SalonIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            >
                                {(isAdminCongregation ||
                                    roleContains('PUBLISHERS_MANAGER') ||
                                    roleContains('PUBLISHERS_VIEWER') ||
                                    roleContains('TALK_MANAGER')) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Publicadores"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/congregacao/publicadores')
                                        }}
                                        icon={() => <PublisherIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/congregacao/publicadores'}
                                    />
                                }

                                {(isAdminCongregation ||
                                    roleContains('GROUPS_MANAGER') ||
                                    roleContains('GROUPS_VIEWER')) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Grupos de Campo"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/congregacao/grupos')
                                        }}
                                        icon={() => <GroupIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                                        active={pageActive === '/congregacao/grupos'}
                                    />
                                }

                                {(isAdminCongregation ||
                                    roleContains('REPORTS_MANAGER') ||
                                    roleContains('REPORTS_VIEWER')
                                ) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Relatórios"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push(`/congregacao/relatorios/${user?.congregation.id}`)
                                        }}
                                        icon={() => <ReportIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === `/congregacao/relatorios/[congregationId]`}
                                    />
                                }

                                {(isAdminCongregation ||
                                    roleContains('ASSISTANCE_MANAGER') ||
                                    roleContains('ASSISTANCE_VIEWER')) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Assistência"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push(`/congregacao/assistencia/${user?.congregation.id}`)
                                        }}
                                        icon={() => <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === `/congregacao/assistencia/[congregationId]`}
                                    />
                                }

                                {(isAdminCongregation ||
                                    roleContains('TERRITORIES_MANAGER') ||
                                    roleContains('TERRITORIES_VIEWER')) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Territórios"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push(`/congregacao/territorios`)
                                        }}
                                        icon={() => <TerritoryIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/congregacao/territorios'}
                                    />
                                }

                                {(isAdminCongregation ||
                                    roleContains('PUBLISHERS_MANAGER') ||
                                    roleContains('PUBLISHERS_VIEWER')) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Contatos de emergência"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push(`/congregacao/contatos-emergencia`)
                                        }}
                                        icon={() => <EmergencyContactIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/congregacao/contatos-emergencia'}
                                    />
                                }
                            </NavBar.ListOptions>
                        }

                        {(isAdminCongregation ||
                            roleContains('TALK_MANAGER') ||
                            roleContains('ADMIN'))
                            &&
                            <NavBar.ListOptions
                                key={"submenuArranjoOradores"}
                                showList={openSubMenu === 'arranjo-oradores'}
                                onClick={() => toggleSubMenu('arranjo-oradores')}
                                title="Arranjo de oradores"
                                icon={() => <PublicMeetingIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            >
                                {isAdminCongregation &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Administração"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push(`/arranjo-oradores/administracao`)
                                        }}
                                        icon={() => <KanbanSquareIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/arranjo-oradores/administracao'}
                                    />}
                                {(isAdmin ||
                                    isAdminCongregation ||
                                    roleContains('TALK_MANAGER')) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Discursos"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push(`/arranjo-oradores/discursos`)
                                        }}
                                        icon={() => <TalkIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/arranjo-oradores/discursos'}
                                    />}
                                {(isAdminCongregation || roleContains('TALK_MANAGER')) &&
                                    <>
                                        <NavBar.Options
                                            isSubItem
                                            title="Programação"
                                            onClick={() => {
                                                { !isDesktop && setIsMenuOpen(false) }
                                                Router.push(`/arranjo-oradores/programacao`)
                                            }}
                                            icon={() => <CalendarMicIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            active={pageActive === '/arranjo-oradores/programacao'}
                                        />
                                        <NavBar.Options
                                            isSubItem
                                            title="Saída de oradores"
                                            onClick={() => {
                                                { !isDesktop && setIsMenuOpen(false) }
                                                Router.push(`/arranjo-oradores/saida-oradores`)
                                            }}
                                            icon={() => <ExternalTalkIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            active={pageActive === '/arranjo-oradores/saida-oradores'}
                                        />
                                        <NavBar.Options
                                            isSubItem
                                            title="Oradores"
                                            onClick={() => {
                                                { !isDesktop && setIsMenuOpen(false) }
                                                Router.push(`/arranjo-oradores/oradores`)
                                            }}
                                            icon={() => <SpeakerIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            active={pageActive === '/arranjo-oradores/oradores'}
                                        />

                                        <NavBar.Options
                                            isSubItem
                                            title="Congregações"
                                            onClick={() => {
                                                { !isDesktop && setIsMenuOpen(false) }
                                                Router.push(`/arranjo-oradores/congregacoes`)
                                            }}
                                            icon={() => <SalonIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            active={pageActive === '/arranjo-oradores/congregacoes'}
                                        />
                                        <NavBar.Options
                                            isSubItem
                                            title="Grupos de hospitalidade"
                                            onClick={() => {
                                                { !isDesktop && setIsMenuOpen(false) }
                                                Router.push(`/arranjo-oradores/grupos-hospitalidade`)
                                            }}
                                            icon={() => <GroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            active={pageActive === '/arranjo-oradores/grupos-hospitalidade'}
                                        />
                                        <NavBar.Options
                                            isSubItem
                                            title="Programação de hospitalidade"
                                            onClick={() => {
                                                { !isDesktop && setIsMenuOpen(false) }
                                                Router.push(`/arranjo-oradores/programacao-hospitalidade`)
                                            }}
                                            icon={() => <UtensilsIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                            active={pageActive === '/arranjo-oradores/programacao-hospitalidade'}
                                        />
                                    </>
                                }
                            </NavBar.ListOptions>
                        }

                        {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                            <NavBar.ListOptions
                                key={"submenuReunioes"}
                                showList={openSubMenu === 'reunioes'}
                                onClick={() => toggleSubMenu('reunioes')}
                                title="Reuniões"
                                icon={() => <MeetingIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            >
                                <NavBar.Options
                                    isSubItem
                                    title="Meio de semana"
                                    onClick={() => {
                                        { !isDesktop && setIsMenuOpen(false) }
                                        Router.push(`/reunioes/meiodesemana`)
                                    }}
                                    icon={() => <LifeAndMinistry className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    active={pageActive === '/reunioes/meiodesemana'}
                                />

                                <NavBar.Options
                                    isSubItem
                                    title="Fim de semana"
                                    onClick={() => {
                                        { !isDesktop && setIsMenuOpen(false) }
                                        Router.push(`/reunioes/fimdesemana`)
                                    }}
                                    icon={() => <PublicMeetingIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    active={pageActive === '/reunioes/fimdesemana'}
                                />
                            </NavBar.ListOptions>
                        }

                        {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                            <NavBar.ListOptions
                                key={"submenuPregacao"}
                                showList={openSubMenu === 'pregacao'}
                                onClick={() => toggleSubMenu('pregacao')}
                                title="Pregação"
                                icon={() => <PreachingIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            >
                                <NavBar.Options
                                    isSubItem
                                    title="Saídas de campo"
                                    onClick={() => {
                                        { !isDesktop && setIsMenuOpen(false) }
                                        Router.push(`/pregacao/saidasdecampo`)
                                    }}
                                    icon={() => <PrechingHomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    active={pageActive === '/pregacao/saidasdecampo'}
                                />

                                <NavBar.Options
                                    isSubItem
                                    title="Testemunho público"
                                    onClick={() => {
                                        { !isDesktop && setIsMenuOpen(false) }
                                        Router.push(`/pregacao/testemunhopublico`)
                                    }}
                                    icon={() => <PublicPreachingIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                    active={pageActive === '/pregacao/testemunhopublico'}
                                />
                            </NavBar.ListOptions>
                        }

                        {isAdmin &&
                            <NavBar.Options
                                title="Usuários"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/usuarios')
                                }}
                                icon={() => <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/usuarios'}
                            />
                        }

                        {isAdmin &&
                            <NavBar.Options
                                title="Permissões"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/permissoes')
                                }}
                                icon={() => <SecurityIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/permissoes'}
                            />
                        }

                        {isAdmin &&
                            <NavBar.Options
                                title="Categorias"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/categorias')
                                }}
                                icon={() => <SquareStackIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/categorias'}
                            />
                        }

                        {isAdmin &&
                            <NavBar.Options
                                title="Congregações"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/congregacoes')
                                }}
                                icon={() => <SalonIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/congregacoes'}
                            />
                        }

                        {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                            <NavBar.Options
                                title="Limpeza"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/limpeza')
                                }}
                                icon={() => <CleanIcon className="w-6 h-6 sm:w-7 sm:h-7" />}
                                active={pageActive === '/limpeza'}
                            />
                        }


                        {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                            <NavBar.Options
                                title="Contas"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/contas')
                                }}
                                icon={() => <CalculatorIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/contas'}
                            />
                        }

                        {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                            <NavBar.Options
                                title="Eventos especiais"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/eventosespeciais')
                                }}
                                icon={() => <CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/eventosespeciais'}
                            />
                        }

                        {(isAdminCongregation || roleContains('NOTICES_MANAGER')) &&
                            <NavBar.Options
                                title="Anúncios"
                                onClick={() => {
                                    { !isDesktop && setIsMenuOpen(false) }
                                    Router.push('/anuncios')
                                }}
                                icon={() => <NoticesIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                active={pageActive === '/anuncios'}
                            />
                        }

                        {(isAdminCongregation || isAdmin) &&
                            <NavBar.ListOptions
                                key={"submenuAdministracao"}
                                showList={openSubMenu === 'administracao'}
                                onClick={() => toggleSubMenu('administracao')}
                                title="Administração"
                                icon={() => <SecurityIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            >

                                {isAdmin &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Funções"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/administracao/funcoes')
                                        }}
                                        icon={() => <FunctionSquareIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/administracao/funcoes'}
                                    />
                                }

                                {isAdmin &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Uso do sistema"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/administracao/controle-uso')
                                        }}
                                        icon={() => <LineChart className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/administracao/controle-uso'}
                                    />
                                }

                                {isAdmin &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Termos de uso"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/administracao/termos')
                                        }}
                                        icon={() => <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/administracao/termos'}
                                    />
                                }

                                {(isAdmin || isAdminCongregation) &&
                                    <NavBar.Options
                                        isSubItem
                                        title="Atribuir função"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/administracao/funcoes/atribuir')
                                        }}
                                        icon={() => <FunctionSquareIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/administracao/funcoes/atribuir'}
                                    />
                                }

                                {(isAdmin || isAdminCongregation) ?
                                    <NavBar.Options
                                        isSubItem
                                        title="Domínio"
                                        onClick={() => {
                                            { !isDesktop && setIsMenuOpen(false) }
                                            Router.push('/administracao/add-domain')
                                        }}
                                        icon={() => <PuzzleIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        active={pageActive === '/administracao/add-domain'}
                                    /> : null
                                }
                            </NavBar.ListOptions>
                        }
                    </ConsentCongregationWrapper>
                </div>
            </NavBar.Root>
            {props.children}
        </main >
    )
}