import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { IPublisherList } from '@/entities/types'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

interface IDropdownSearch {
  title: string | undefined
  options: IPublisherList[]
  handleClick: (option: IPublisherList) => void
  border?: boolean
  full?: boolean
}

export default function DropdownSearch(props: IDropdownSearch) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(props.options)
  const [publisherSelected, setPublisherSelected] = useState('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)

    const filtered = props.options.filter(option => {
      const fullNameMatch = option.fullName.toLowerCase().includes(query.toLowerCase())
      const nicknameMatch = option.nickname.toLowerCase().includes(query.toLowerCase())
      const congregationIdMatch = option.congregation_id.toLowerCase().includes(query.toLowerCase())

      return fullNameMatch || nicknameMatch || congregationIdMatch
    })
    setFilteredOptions(filtered)
  }

  return (
    <Menu as="div" className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button className={`inline-flex w-full justify-between rounded-md  bg-transparent border px-4 py-4 text-sm font-medium text-gray-500 shadow-sm hover:underline focus:outline-none focus:ring-1 focus:ring-primary-100   ${props.border ? "border border-blue-gray-200" : "border-none"} `}>
          <div className='flex'>
            <span>{props.title}</span>
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </div>
          <span>{publisherSelected}</span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute cursor-pointer left-0 z-10  w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto">
          <div className="py-1">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-400 focus:border-primary-100"
              placeholder="Pesquisar..."
            />
            {filteredOptions.map((option, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <span
                    onClick={() => {
                      props.handleClick({
                        fullName: option.fullName,
                        nickname: option.nickname,
                        congregation_id: option.congregation_id
                      }),
                      setPublisherSelected(`${option.fullName} ${option.nickname && `(${option.nickname})`}`)
                    }}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {option.fullName} {option.nickname !== "" && `(${option.nickname})`}
                  </span>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
