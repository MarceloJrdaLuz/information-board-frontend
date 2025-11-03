import { openSubMenuAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { useAtom } from "jotai"
import { CalculatorIcon, CalendarDaysIcon, ClipboardList, FileTextIcon, FunctionSquareIcon, HomeIcon, SquareStackIcon, UsersIcon, UtensilsIcon } from 'lucide-react'
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
import { LayoutProps } from "./types"
import { ConsentCongregationWrapper } from "../wrappers/ConsentCongregationWrapper"

export default function Layout(props: LayoutProps) {

    const router = useRouter()

    const { user: getUser, roleContains, loading } = useAuthContext()
    const [isHovering, setIsHovering] = useState(props.pageActive)
    const [user, setUser] = useState(getUser)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [openSubMenu, setOpenSubMenu] = useAtom(openSubMenuAtom)

    useEffect(() => {
        const path = router.pathname
        const parts = path.split('/')
        const middlePart = parts[1]

        setOpenSubMenu(middlePart) // Define o submenu ativo baseado na URL
    }, [router.pathname, setOpenSubMenu])

    useEffect(() => {
        setUser(getUser)
    }, [setUser, getUser])

    const toggleSubMenu = (menuKey: string) => {
        setOpenSubMenu((prev) => (prev === menuKey ? null : menuKey))
    }

    const isAdmin = roleContains('ADMIN')

    const isAdminCongregation = roleContains('ADMIN_CONGREGATION')

    return (
        <main className={`flex w-screen h-screen max-h-full overflow-y-auto`}>
            {loading ? (
                <NavBar.Root>
                    <NavBar.Skeleton items={5} />
                </NavBar.Root>
            ) : (
                <>
                    <NavBar.Root>
                        {/* <NavBar.Logo /> */}
                        <NavBar.Options
                            title="Início"
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen)
                                Router.push('/dashboard')
                            }}
                            icon={HomeIcon}
                            active={props.pageActive === 'dashboard'}
                        />

                        <ConsentCongregationWrapper>
                            <NavBar.Options
                                title="Meus relatórios"
                                onClick={() => {
                                    setIsMenuOpen(!isMenuOpen)
                                    Router.push('/meus-relatorios')
                                }}
                                icon={MyReportsIcon}
                                active={props.pageActive === 'meus-relatorios'}
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

                            {(isAdminCongregation || roleContains('NOTICES_MANAGER')) &&
                                <NavBar.Options
                                    title="Anúncios"
                                    onClick={() => {
                                        setIsMenuOpen(!isMenuOpen)
                                        Router.push('/anuncios')
                                    }}
                                    icon={NoticesIcon}
                                    active={props.pageActive === 'anuncios'}
                                />
                            }

                            {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
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


                            {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
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

                            {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
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

                            {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                                <NavBar.ListOptions
                                    key={"submenuReunioes"}
                                    showList={openSubMenu === 'reunioes'}
                                    onClick={() => toggleSubMenu('reunioes')}
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

                            {(isAdminCongregation ||
                                roleContains('TALK_MANAGER') ||
                                roleContains('ADMIN'))
                                &&
                                <NavBar.ListOptions
                                    key={"submenuArranjoOradores"}
                                    showList={openSubMenu === 'arranjo-oradores'}
                                    onClick={() => toggleSubMenu('arranjo-oradores')}
                                    title="Arranjo de oradores"
                                    icon={PublicMeetingIcon}
                                >
                                    {(isAdmin ||
                                        isAdminCongregation ||
                                        roleContains('TALK_MANAGER')) &&
                                        <NavBar.Options
                                            title="Discursos"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push(`/arranjo-oradores/discursos`)
                                            }}
                                            icon={TalkIcon}
                                            active={props.pageActive === 'discursos'}
                                        />}
                                    {(isAdminCongregation || roleContains('TALK_MANAGER')) &&
                                        <>
                                            <NavBar.Options
                                                title="Programação"
                                                onClick={() => {
                                                    setIsMenuOpen(!isMenuOpen)
                                                    Router.push(`/arranjo-oradores/programacao`)
                                                }}
                                                icon={CalendarMicIcon}
                                                active={props.pageActive === 'programacao'}
                                            />
                                            <NavBar.Options
                                                title="Saída de oradores"
                                                onClick={() => {
                                                    setIsMenuOpen(!isMenuOpen)
                                                    Router.push(`/arranjo-oradores/saida-oradores`)
                                                }}
                                                icon={ExternalTalkIcon}
                                                active={props.pageActive === 'saida-oradores'}
                                            />
                                            <NavBar.Options
                                                title="Oradores"
                                                onClick={() => {
                                                    setIsMenuOpen(!isMenuOpen)
                                                    Router.push(`/arranjo-oradores/oradores`)
                                                }}
                                                icon={SpeakerIcon}
                                                active={props.pageActive === 'oradores'}
                                            />

                                            <NavBar.Options
                                                title="Congregações"
                                                onClick={() => {
                                                    setIsMenuOpen(!isMenuOpen)
                                                    Router.push(`/arranjo-oradores/congregacoes`)
                                                }}
                                                icon={SalonIcon}
                                                active={props.pageActive === 'congregacoes'}
                                            />
                                            <NavBar.Options
                                                title="Grupos de hospitalidade"
                                                onClick={() => {
                                                    setIsMenuOpen(!isMenuOpen)
                                                    Router.push(`/arranjo-oradores/grupos-hospitalidade`)
                                                }}
                                                icon={GroupIcon}
                                                active={props.pageActive === 'grupos-hospitalidade'}
                                            />
                                            <NavBar.Options
                                                title="Programação de hospitalidade"
                                                onClick={() => {
                                                    setIsMenuOpen(!isMenuOpen)
                                                    Router.push(`/arranjo-oradores/programacao-hospitalidade`)
                                                }}
                                                icon={UtensilsIcon}
                                                active={props.pageActive === 'programacao-hospitalidade'}
                                            />
                                        </>
                                    }

                                </NavBar.ListOptions>
                            }

                            {(isAdminCongregation || roleContains('DOCUMENTS_MANAGER')) &&
                                <NavBar.ListOptions
                                    key={"submenuPregacao"}
                                    showList={openSubMenu === 'pregacao'}
                                    onClick={() => toggleSubMenu('pregacao')}
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
                                    icon={SalonIcon}
                                >
                                    {(isAdminCongregation ||
                                        roleContains('PUBLISHERS_MANAGER') ||
                                        roleContains('PUBLISHERS_VIEWER') ||
                                        roleContains('TALK_MANAGER')) &&
                                        <NavBar.Options
                                            title="Publicadores"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push('/congregacao/publicadores')
                                            }}
                                            icon={PublisherIcon}
                                            active={props.pageActive === 'publicadores'}
                                        />
                                    }

                                    {(isAdminCongregation ||
                                        roleContains('GROUPS_MANAGER') ||
                                        roleContains('GROUPS_VIEWER')) &&
                                        <NavBar.Options
                                            title="Grupos de Campo"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push('/congregacao/grupos')
                                            }}
                                            icon={GroupIcon}
                                            active={props.pageActive === 'grupos'}
                                        />
                                    }

                                    {(isAdminCongregation ||
                                        roleContains('REPORTS_MANAGER') ||
                                        roleContains('REPORTS_VIEWER')
                                    ) &&
                                        <NavBar.Options
                                            title="Relatórios"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push(`/congregacao/relatorios/${user?.congregation.id}`)
                                            }}
                                            icon={ReportIcon}
                                            active={props.pageActive === 'relatorios'}
                                        />
                                    }

                                    {(isAdminCongregation ||
                                        roleContains('ASSISTANCE_MANAGER') ||
                                        roleContains('ASSISTANCE_VIEWER')) &&
                                        <NavBar.Options
                                            title="Assistência"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push(`/congregacao/assistencia/${user?.congregation.id}`)
                                            }}
                                            icon={FileTextIcon}
                                            active={props.pageActive === 'assistencia'}
                                        />
                                    }

                                    {(isAdminCongregation ||
                                        roleContains('TERRITORIES_MANAGER') ||
                                        roleContains('TERRITORIES_VIEWER')) &&
                                        <NavBar.Options
                                            title="Territórios"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push(`/congregacao/territorios`)
                                            }}
                                            icon={TerritoryIcon}
                                            active={props.pageActive === 'territorios'}
                                        />
                                    }

                                    {(isAdminCongregation ||
                                        roleContains('PUBLISHERS_MANAGER') ||
                                        roleContains('PUBLISHERS_VIEWER')) &&
                                        <NavBar.Options
                                            title="Contatos de emergência"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push(`/congregacao/contatos-emergencia`)
                                            }}
                                            icon={EmergencyContactIcon}
                                            active={props.pageActive === 'contatos-emergencia'}
                                        />
                                    }
                                </NavBar.ListOptions>
                            }

                            {(isAdminCongregation || isAdmin) &&
                                <NavBar.ListOptions
                                    key={"submenuAdministracao"}
                                    showList={openSubMenu === 'administracao'}
                                    onClick={() => toggleSubMenu('administracao')}
                                    title="Administração"
                                    icon={SecurityIcon}
                                >

                                    {isAdmin &&
                                        <NavBar.Options
                                            title="Funções"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push('/administracao/funcoes')
                                            }}
                                            icon={FunctionSquareIcon}
                                            active={props.pageActive === 'funcoes'}
                                        />
                                    }

                                    {isAdmin &&
                                        <NavBar.Options
                                            title="Termos de uso"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push('/administracao/termos')
                                            }}
                                            icon={ClipboardList}
                                            active={props.pageActive === 'termos'}
                                        />
                                    }

                                    {(isAdmin || isAdminCongregation) &&
                                        <NavBar.Options
                                            title="Atribuir função"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push('/administracao/funcoes/atribuir')
                                            }}
                                            icon={FunctionSquareIcon}
                                            active={props.pageActive === '/funcoes/atribuir'}
                                        />
                                    }

                                    {(isAdmin || isAdminCongregation) ?
                                        <NavBar.Options
                                            title="Domínio"
                                            onClick={() => {
                                                setIsMenuOpen(!isMenuOpen)
                                                Router.push('/administracao/add-domain')
                                            }}
                                            icon={PuzzleIcon}
                                            active={props.pageActive === 'add-domain'}
                                        /> : null
                                    }
                                </NavBar.ListOptions>
                            }

                        </ConsentCongregationWrapper>
                    </NavBar.Root>
                </>
            )
            }
            {props.children}
        </main >
    )
}