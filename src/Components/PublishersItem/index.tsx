// PublisherItem.tsx
import React from 'react';
import { useAtom } from 'jotai';
import { groupPublisherList, selectedPublishersAtom } from '@/atoms/atom';
import { IPublisher } from '@/entities/types';

interface IPublisherItemProps {
  publisher: IPublisher,
  group_id: string,
}

export default function PublisherItem({ publisher, group_id }: IPublisherItemProps) {
  const [selectedPublishers, setSelectedPublishers] = useAtom(selectedPublishersAtom)
  const [groupPublisherListOption, setGroupPublisherListOption] = useAtom(groupPublisherList)


  const isSelected = selectedPublishers.includes(publisher.id);

  const toggleSelection = () => {
    if (isSelected) {
      setSelectedPublishers((prevSelected) =>
        prevSelected.filter((id) => id !== publisher.id)
      );
    } else {
      setSelectedPublishers((prevSelected) => [...prevSelected, publisher.id]);
    }
  };

  return (
    <li
      onClick={toggleSelection}
      className={`my-1 w-full list-none ${(
        groupPublisherListOption === 'add-publishers' ||
        groupPublisherListOption === 'remove-publishers'
      ) && 'cursor-pointer'} bg-white  ${isSelected && `${groupPublisherListOption === 'add-publishers' && 'bg-light-blue-100'} `} ${isSelected && `${groupPublisherListOption === 'remove-publishers' && 'bg-red-400 text-white'}`}  `}
    >
      <div className={`flex flex-col w-full p-4`}>
        <span>{publisher.fullName}</span>
        {publisher?.group?.id !== group_id && publisher.group && <span>{`Pertence ao grupo: ${publisher?.group?.number}`}</span>}
      </div>
    </li>
  );
};

