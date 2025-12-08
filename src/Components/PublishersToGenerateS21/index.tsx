// PublisherItem.tsx
import { selectedPublishersToS21Atom } from '@/atoms/atom'
import { IPublisher } from '@/types/types'
import { useAtom } from 'jotai'
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

            className={`flex justify-between flex-wrap my-1 w-full list-none cursor-pointer ${isSelected ? "bg-gradient-to-br from-primary-100 to-primary-150" : "bg-surface-100 hover:bg-surface-100/50"} `}
        >
            <div onClick={toggleSelection} className={`flex flex-1 whitespace-nowrap p-4 text-typography-700`}>
                <span>{publisher.fullName}</span>
            </div>
            {children}
        </li>
    )
}