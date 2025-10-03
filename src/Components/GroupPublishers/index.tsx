// PublisherItem.tsx
import { IPublisher } from '@/types/types'
import PublisherItem from '../PublishersItem'

interface IGroupPublishersProps {
    publishers: IPublisher[] 
    group_id: string
}

export default function GroupPublishers ({publishers, group_id}: IGroupPublishersProps) {

  return (
    <ul className='overflow-auto max-h-80 thin-scrollbar w-full'>
      {publishers.map(publisher => (
        <PublisherItem key={publisher.id + publisher.fullName} publisher={publisher} group_id={group_id}/>
      ))}
    </ul>
  )
}

