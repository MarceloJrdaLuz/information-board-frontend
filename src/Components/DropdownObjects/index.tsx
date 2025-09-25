import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { XSquareIcon } from 'lucide-react'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

interface IDropdown<T> {
  classname?: string
  title: string
  items: T[]
  selectedItem: T | null
  handleChange: (item: T | null) => void
  border?: boolean
  full?: boolean
  position?: 'right' | 'left'
  textVisible?: boolean
  textAlign?: 'right' | 'left' | 'center'
  emptyMessage?: string
  labelKey?: keyof T
  labelKeySecondary?: keyof T
}

export default function DropdownObject<T>(props: IDropdown<T>) {
  const { items, selectedItem, emptyMessage, title } = props

  const getLabel = (item: T): string => {
    if (props.labelKey && item[props.labelKey]) {
      return String(item[props.labelKey])
    }
    return String(item)
  }

  const getLabelSecondary = (item: T): string => {
    if (props.labelKeySecondary && item[props.labelKeySecondary]) {
      return String(item[props.labelKeySecondary])
    }
    return ''
  }

  return (
    <Menu as="div" className={`relative ${props.full ? 'w-full' : 'inline-block'} ${props.classname}`}>
      <div>
        <Menu.Button
          className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          {/* Sempre mostrar o título */}
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col truncate text-left">
              <span className="text-gray-400 text-xs">{title}</span>
              <span className="truncate">{selectedItem ? getLabel(selectedItem) : 'Selecione...'}</span>
            </div>

            <div className="flex items-center gap-1">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              {selectedItem && (
                <span
                  role='button'
                  onClick={(e) => { e.stopPropagation(); props.handleChange(null) }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <XSquareIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </span>
              )}
            </div>
          </div>
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
        <Menu.Items
          className={`absolute ${props.position}-0 z-50 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-80 overflow-auto thin-scrollbar`}
        >
          <div className="py-1">
            {items.length === 0 ? (
              emptyMessage ? (
                <span className="block px-4 py-2 text-sm text-gray-400 italic">{emptyMessage}</span>
              ) : null
            ) : (
              items.map((item, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <span
                      onClick={() => props.handleChange(item)}
                      className={classNames(
                        active ? 'bg-primary-50 text-primary-700' : 'text-gray-700',
                        'flex flex-col px-4 py-2 text-sm cursor-pointer rounded-md'
                      )}
                    >
                      <span>{getLabel(item)}</span>
                      {getLabelSecondary(item) && (
                        <span className="text-xs text-gray-400">{getLabelSecondary(item)}</span>
                      )}
                    </span>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
