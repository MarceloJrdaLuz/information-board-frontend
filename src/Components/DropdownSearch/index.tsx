import { iconeAddPessoa } from '@/assets/icons'
import { sortArrayByProperty } from '@/functions/sortObjects'
import { IPublisherList } from '@/types/types'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

interface IDropdownSearch {
  title: string | undefined
  options: IPublisherList[]
  handleClick: (option: IPublisherList) => void
  border?: boolean
  full?: boolean
  emptyMessage?: string
}

export default function DropdownSearch(props: IDropdownSearch) {
  const router = useRouter()
  const { number } = router.query
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(props.options)
  const [publisherSelected, setPublisherSelected] = useState('')
  const [publisherRecover, setPublisherRecover] = useState<IPublisherList[]>()
  const [addPublisher, setAddPublisher] = useState(false)

  useEffect(() => {
    const sortOptions = sortArrayByProperty(props.options, "fullName")
    setFilteredOptions(sortOptions)
  }, [addPublisher, props.options])

  useEffect(() => {
    const publisherData = localStorage.getItem('publisher')

    if (publisherData && !addPublisher) {
      const parsed: IPublisherList[] = JSON.parse(publisherData)

      // 🔥 pega só ids válidos
      const validIds = parsed
        .map(p => p?.id)
        .filter(Boolean)

      // 🔥 se não tiver nenhum id válido → mostra lista completa
      if (validIds.length === 0) {
        const sorted = sortArrayByProperty(props.options, "fullName")
        setFilteredOptions(sorted)
        setPublisherRecover(undefined)
        return
      }

      // 🔥 filtra usando SOMENTE id
      const filtered = props.options.filter(option =>
        validIds.includes(option.id)
      )

      const sorted = sortArrayByProperty(filtered, "fullName")

      setFilteredOptions(sorted)
      setPublisherRecover(sorted)

    } else {
      const sorted = sortArrayByProperty(props.options, "fullName")
      setFilteredOptions(sorted)
    }

  }, [props.options, number, addPublisher])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)

    let baseList: IPublisherList[] = props.options

    // 🔥 se estiver no modo "só storage"
    if (localStorage.getItem('publisher') && !addPublisher) {
      const publisherData = localStorage.getItem('publisher')

      if (publisherData) {
        const parsed: IPublisherList[] = JSON.parse(publisherData)

        const validIds = parsed
          .map(p => p?.id)
          .filter(Boolean)

        if (validIds.length > 0) {
          baseList = props.options.filter(option =>
            validIds.includes(option.id)
          )
        }
      }
    }

    // 🔥 filtro único (serve pros dois casos)
    const filtered = baseList.filter(option => {
      const fullNameMatch = option.fullName.toLowerCase().includes(query.toLowerCase())
      const nicknameMatch = option.nickname?.toLowerCase().includes(query.toLowerCase())
      const congregationIdMatch = option.congregation_id.toLowerCase().includes(query.toLowerCase())

      return fullNameMatch || nicknameMatch || congregationIdMatch
    })

    setFilteredOptions(filtered)
  }

  return (
    <Menu as="div" className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button className={`inline-flex w-full justify-between items-center rounded-xl bg-surface-100 border px-4 py-2.5 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-200 ${publisherSelected ? "border-primary-200 text-typography-800 font-semibold" : "border-surface-300 text-typography-500 hover:border-primary-200"}`}>
          <span className="truncate">{publisherSelected || props.title}</span>
          <ChevronDownIcon className="ml-2 h-5 w-5 text-typography-400 shrink-0" aria-hidden="true" />
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
        <Menu.Items className="absolute cursor-pointer left-0 z-10 w-full origin-top-right rounded-md bg-surface-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto hide-scrollbar">
          <div className="py-1">
            <input
              type="text"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              value={searchQuery}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 text-sm text-typography-700 border border-typography-300 rounded-md focus:outline-none focus:ring-indigo-400 focus:border-primary-100 bg-surface-100 placeholder:text-typography-600"
              placeholder="Pesquisar..."
            />
            {filteredOptions.length === 0 ? (
              props.emptyMessage ? (
                <span className="block px-4 py-2 text-sm text-typography-400 italic">{props.emptyMessage}</span>
              ) : null
            ) : (filteredOptions.map((option, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <span
                    onClick={() => {
                      props.handleClick(option)
                      setPublisherSelected(`${option.fullName} ${option.nickname && `(${option.nickname})`}`)
                    }}
                    className={classNames(
                      active ? 'bg-surface-200 text-typography-900' : 'text-typography-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {option.fullName} {option.nickname !== "" && `(${option.nickname})`}
                  </span>
                )}
              </Menu.Item>)
            ))}
          </div>
          {publisherRecover && !addPublisher && (
            <div
              className='flex justify-center items-center gap-2 p-1 cursor-pointer'
              onClick={() => setAddPublisher(true)}
            >
              <span>{iconeAddPessoa("#178582")}</span>
              <span className='text-typography-700 italic'>
                Adicionar mais um publicador
              </span>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
