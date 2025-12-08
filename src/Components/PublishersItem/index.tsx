import { groupPublisherList, selectedPublishersAtom } from '@/atoms/atom'
import { IPublisher } from '@/types/types'
import { useAtom } from 'jotai'

interface IPublisherItemProps {
  publisher: IPublisher,
  group_id: string,
}

export default function PublisherItem({ publisher, group_id }: IPublisherItemProps) {
  const [selectedPublishers, setSelectedPublishers] = useAtom(selectedPublishersAtom)
  const [groupPublisherListOption, setGroupPublisherListOption] = useAtom(groupPublisherList)

  const isSelected = selectedPublishers.includes(publisher.id)

  const toggleSelection = () => {
    if (isSelected) {
      setSelectedPublishers((prevSelected) =>
        prevSelected.filter((id) => id !== publisher.id)
      )
    } else {
      setSelectedPublishers((prevSelected) => [...prevSelected, publisher.id])
    }
  }

  return (
    <li
      onClick={toggleSelection}
      className={`my-1 w-full list-none ${(
        groupPublisherListOption === 'add-publishers' ||
        groupPublisherListOption === 'remove-publishers'
      ) && 'cursor-pointer'} ${isSelected ? `${groupPublisherListOption === 'add-publishers' && 'bg-gradient-to-br from-primary-100 to-primary-150'} `:"bg-surface-100"} ${isSelected ? `${groupPublisherListOption === 'remove-publishers' && 'bg-red-400 text-surface-100'}`:"bg-surface-100"} ${groupPublisherListOption === "disabled" && "bg-surface-100"} `}
    >
      <div className={`flex flex-col w-full p-4`}>
        <span>{publisher.fullName}</span>
        {publisher?.group?.id !== group_id && publisher.group && <span>{`Pertence ao grupo: ${publisher?.group?.number}`}</span>}
      </div>
    </li>
  )
}

