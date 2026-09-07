// PublisherItem.tsx
import { selectedPublishersToS21Atom } from '@/atoms/atom'
import AvatarFemale from '@/Components/AvatarFemale'
import avatarMale from '../../../public/images/avatar-male.png'
import { IPublisher } from '@/types/types'
import { useAtom } from 'jotai'
import { Check, Users } from 'lucide-react'
import Image from 'next/image'
import { ReactNode } from 'react'

interface IPublisherItemProps {
    publisher: IPublisher
    onClick?: () => void
    children?: ReactNode
}

export default function PublishersToGenerateS21({ publisher, onClick, children }: IPublisherItemProps) {
    const [selectedPublishersToS21, setSelectedPublishersToS21] = useAtom(selectedPublishersToS21Atom)

    const isSelected = selectedPublishersToS21.includes(publisher.id)

    const toggleSelection = () => {
        if (onClick) {
            onClick()
        }
        if (isSelected) {
            setSelectedPublishersToS21((prevSelected) =>
                prevSelected.filter((id) => id !== publisher.id)
            )
        } else {
            setSelectedPublishersToS21((prevSelected) => [...prevSelected, publisher.id])
        }
    }

    return (
        <li
            onClick={toggleSelection}
            className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 my-1 w-full rounded-2xl border transition-all cursor-pointer select-none list-none ${
                isSelected
                    ? "bg-primary-200/5 border-primary-200 shadow-sm ring-1 ring-primary-200/30"
                    : "bg-surface-100 border-surface-300 hover:border-primary-200/50 hover:bg-surface-200/40 shadow-2xs"
            }`}
        >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Custom Checkbox */}
                <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                            ? "bg-primary-200 border-primary-200 text-white shadow-xs"
                            : "border-surface-300 bg-surface-200/50 text-transparent"
                    }`}
                >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                {/* Avatar */}
                <div className="shrink-0 relative">
                    {publisher.gender === "Masculino" ? (
                        <Image
                            alt="Avatar de um homem"
                            src={avatarMale}
                            className="w-9 h-9 rounded-full bg-primary-200/10 object-cover border border-surface-300/60"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-200/10 flex items-center justify-center border border-surface-300/60">
                            <AvatarFemale className="w-9 h-9 rounded-full text-primary-200" />
                        </div>
                    )}
                </div>

                {/* Detalhes do Publicador */}
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-typography-800 truncate">
                            {publisher.fullName}
                        </span>
                        {publisher.nickname && (
                            <span className="text-xs text-typography-500 font-normal">
                                ({publisher.nickname})
                            </span>
                        )}
                    </div>

                    {/* Badges de privilégios e grupo */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {publisher.group && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-200 text-typography-600 border border-surface-300">
                                <Users className="w-3 h-3 text-primary-200" />
                                <span>{publisher.group.name || `Grupo ${publisher.group.number}`}</span>
                            </span>
                        )}

                        {publisher.privileges && publisher.privileges.length > 0 && publisher.privileges.map((priv, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary-200/10 text-primary-200 border border-primary-200/20"
                            >
                                {priv}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {children && (
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    {children}
                </div>
            )}
        </li>
    )
}