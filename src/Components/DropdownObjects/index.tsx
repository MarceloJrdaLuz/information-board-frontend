import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { XSquareIcon } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'

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
  searchable?: boolean
  borderColor?: string
  showSecondaryLabelOnSelected?: boolean
}

export default function DropdownObject<T>(props: IDropdown<T>) {
  const { items, selectedItem, emptyMessage, title, searchable } = props
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState(items)

  useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(items)
    } else {
      const filtered = items.filter((item) => {
        const label = getLabel(item).toLowerCase()
        const secondary = getLabelSecondary(item).toLowerCase()
        return (
          label.includes(searchQuery.toLowerCase()) ||
          secondary.includes(searchQuery.toLowerCase())
        )
      })
      setFilteredItems(filtered)
    }
  }, [searchQuery, items])

  const getLabel = (item: T): string => {
    if ((item as any).id === "" && (item as any).title === "Nenhum") return "Nenhum"
    if (props.labelKey && item[props.labelKey]) return String(item[props.labelKey])
    return String(item)
  }

  const getLabelSecondary = (item: T): string => {
    if ((item as any).id === "" && (item as any).title === "Nenhum") return ""
    if (props.labelKeySecondary && item[props.labelKeySecondary]) return String(item[props.labelKeySecondary])
    return ""
  }

  const getDisplayLabel = (item: T) => {
    const label = getLabel(item)
    const secondary = getLabelSecondary(item)
    if (!secondary || secondary.trim() === label.trim()) return label
    return `${label} - ${secondary}`
  }

  return (
    <Menu as="div" className={`relative ${props.full ? 'w-full' : 'inline-block'} ${props.classname}`}>
      <div>
        <Menu.Button
          className={`w-full flex items-center justify-between rounded-xl border border-surface-300 bg-surface-100 px-4 py-2.5 text-sm text-typography-800 shadow-xs hover:border-primary-200/80 focus:outline-none focus:ring-2 focus:ring-primary-200/20 transition-all`}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col truncate text-left">
              <span className="text-typography-400 text-xs font-medium">{title}</span>
              <span className="truncate font-semibold text-typography-800">
                {selectedItem
                  ? props.showSecondaryLabelOnSelected
                    ? getDisplayLabel(selectedItem)
                    : getLabel(selectedItem)
                  : "Selecione..."}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <ChevronDownIcon className="h-5 w-5 text-typography-400 shrink-0" />
              {selectedItem && (
                <span
                  role='button'
                  onClick={(e) => { e.stopPropagation(); props.handleChange(null) }}
                  className="p-1 rounded-md hover:bg-surface-200 transition-colors"
                >
                  <XSquareIcon className="w-4 h-4 text-typography-400 hover:text-red-500" />
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
          className={`absolute ${props.position === 'right' ? 'right-0' : 'left-0'} z-50 mt-2 w-full min-w-[18rem] max-w-sm origin-top-left rounded-xl bg-surface-100 shadow-2xl border border-surface-300 focus:outline-none max-h-72 overflow-auto thin-scrollbar p-1.5`}
        >
          <div>
            {searchable && (
              <div className="p-1 border-b border-surface-300 mb-1">
                <input
                  type="text"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-3 py-2 text-sm bg-surface-200/50 text-typography-800 rounded-lg border border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200/20"
                  placeholder="Pesquisar..."
                />
              </div>
            )}

            {filteredItems.length === 0 ? (
              emptyMessage ? (
                <span className="block px-4 py-2 text-sm text-typography-400 italic">{emptyMessage}</span>
              ) : null
            ) : (
              filteredItems.map((item, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <span
                      onClick={() => props.handleChange(item)}
                      className={classNames(
                        active ? 'bg-surface-200 text-typography-900 font-medium' : 'text-typography-700',
                        'flex items-center gap-3 px-3.5 py-2 text-sm cursor-pointer rounded-lg transition-colors'
                      )}
                    >
                      <span>{getDisplayLabel(item)}</span>
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
