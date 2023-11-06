// PublisherItem.tsx
import React, { useEffect } from 'react'
import { useAtom } from 'jotai'
import {  selectedPublishersAtom, selectedPublishersToS21Atom } from '@/atoms/atom'
import { IPublisher } from '@/entities/types'

interface IPublisherItemProps {
  publisher: IPublisher,
}

export default function PublishersToGenerateS21({publisher}: IPublisherItemProps)  {
  const [selectedPublishersToS21, setSelectedPublishersToS21] = useAtom(selectedPublishersToS21Atom)

  const isSelected = selectedPublishersToS21.includes(publisher.id)

  const toggleSelection = () => {
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
          className={`my-1 w-full list-none cursor-pointer ${isSelected ? "bg-gradient-to-tr from-primary-50 to-primary-100" : "bg-white"} `}
      >
          <div className={`flex flex-col w-full p-4 text-gray-700`}>
              <span>{publisher.fullName}</span>
          </div>
      </li>
  )
}