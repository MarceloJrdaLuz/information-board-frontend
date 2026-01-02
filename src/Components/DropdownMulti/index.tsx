import { Fragment, useEffect, useRef, useState } from "react"
import { Menu, Transition } from "@headlessui/react"
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid"

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ")
}

interface IDropdownMulti<T> {
  title: string | undefined
  items: T[]
  selectedItems: T[]
  handleChange: (items: T[]) => void
  border?: boolean
  full?: boolean
  position?: "right" | "left"
  textVisible?: boolean
  labelKey?: keyof T
  labelKeySecondary?: keyof T
  labelRenderer?: (item: T) => string
  searchable?: boolean
  emptyMessage?: string
  showOrder?: boolean
  orderHint?: string
}

export default function DropdownMulti<T>(props: IDropdownMulti<T>) {
  const { items, selectedItems, searchable, emptyMessage } = props
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState(items)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    if (props.labelRenderer) return props.labelRenderer(item)
    if (props.labelKey && item[props.labelKey]) {
      return String(item[props.labelKey])
    }
    return String(item)
  }


  const getLabelSecondary = (item: T): string => {
    if (props.labelKeySecondary && item[props.labelKeySecondary]) {
      return String(item[props.labelKeySecondary])
    }
    return ""
  }

  const isSelected = (item: T) =>
    selectedItems.some(
      (selected) => JSON.stringify(selected) === JSON.stringify(item)
    )

  const toggleSelect = (item: T) => {
    if (isSelected(item)) {
      props.handleChange(
        selectedItems.filter(
          (selected) => JSON.stringify(selected) !== JSON.stringify(item)
        )
      )
    } else {
      props.handleChange([...selectedItems, item])
    }
  }

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <Menu
      as="div"
      ref={dropdownRef}
      className={`relative inline-block text-left ${props.full && "w-full"}`}
    >
      <div>
        <Menu.Button
          onClick={() => setOpen(!open)}
          className={`inline-flex w-full justify-between rounded-md bg-transparent border px-3 md:px-4 py-2 text-typography-700 hover:underline focus:outline-none focus:ring-1 focus:ring-primary-200 focus:ring-offset-1  ${props.border ? "border border-blue-gray-200" : "border-none"
            }`}
        >
          <span className={`${!props.textVisible && "hidden"} sm:flex`}>
            {selectedItems.length === 0 && props.title}
            {selectedItems.length === 1 && getLabel(selectedItems[0])}
            {selectedItems.length > 1 && `${selectedItems.length} selecionados`}
          </span>
          <ChevronDownIcon className="-mr-1 sm:ml-2 h-5 w-5 text-typography-500" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        show={open}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className={`absolute thin-scrollbar cursor-pointer ${props.position ? props.position : "right"
            }-0 z-10 mt-2 w-60 origin-top-right rounded-md bg-surface-100 shadow-lg ring-1 ring-typography-900 ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto`}
        >
          <div className="py-1">
            {searchable && (
              <input
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full px-3 py-2 text-sm border-b bg-surface-100 border-typography-700 focus:outline-none text-typography-800"
                placeholder="Pesquisar..."
              />
            )}
            {props.showOrder && props.orderHint && selectedItems.length > 1 && (
              <div className="mt-1 text-xs text-typography-500 flex items-center gap-1 p-2">
                <span className="font-medium">ℹ️</span>
                <span>{props.orderHint}</span>
              </div>
            )}
            {filteredItems.length === 0 ? (
              emptyMessage ? (
                <span className="block px-4 py-2 text-sm text-typography-400 italic">{emptyMessage}</span>
              ) : null
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleSelect(item)}
                  className={classNames(
                    "flex items-center gap-x-2 px-4 py-2 text-sm cursor-pointer hover:bg-surface-200 hover:text-typography-900",
                    isSelected(item)
                      ? "font-medium text-primary-200"
                      : "text-typography-700"
                  )}
                >
                  {isSelected(item) ? (
                    <CheckIcon className="flex-shrink-0 w-5 h-5 text-primary-200" />
                  ) : (
                    <span className="flex-shrink-0 w-5 h-5 border rounded-sm"></span>
                  )}
                  <span className="pr-2"><span className="flex items-center gap-2 pr-2">
                    {props.showOrder && isSelected(item) && (
                      <span className="text-xs font-semibold text-primary-200 w-5 text-right">
                        {selectedItems.findIndex(
                          selected => JSON.stringify(selected) === JSON.stringify(item)
                        ) + 1}º
                      </span>
                    )}

                    <span>{getLabel(item)}</span>
                  </span>
                  </span>
                  <span>{getLabelSecondary(item) !== "" && getLabelSecondary(item)}</span>
                </div>)
              ))}
          </div>
        </div>
      </Transition>
    </Menu>
  )
}