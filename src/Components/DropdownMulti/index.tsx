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
  textAlign?: "right" | "left" | "center"
  labelKey?: keyof T
  labelKeySecondary?: keyof T
}

export default function DropdownMulti<T>(props: IDropdownMulti<T>) {
  const { items, selectedItems } = props
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    return ""
  }

  const isSelected = (item: T) =>
    selectedItems.some((selected) => JSON.stringify(selected) === JSON.stringify(item))

  const toggleSelect = (item: T) => {
    if (isSelected(item)) {
      props.handleChange(selectedItems.filter((selected) => JSON.stringify(selected) !== JSON.stringify(item)))
    } else {
      props.handleChange([...selectedItems, item])
    }
  }

  // 👉 Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <Menu as="div" ref={dropdownRef} className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button
          onClick={() => setOpen(!open)}
          className={`inline-flex w-full justify-${
            props.textAlign ? `${props.textAlign}` : `center`
          } rounded-md bg-transparent border px-3 md:px-4 py-2 font-medium text-gray-700 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-100 ${
            props.border ? "border border-blue-gray-200" : "border-none"
          }`}
        >
          <span className={`${!props.textVisible && "hidden"} sm:flex`}>
            {selectedItems.length === 0 && props.title}
            {selectedItems.length === 1 && getLabel(selectedItems[0])}
            {selectedItems.length > 1 && `${selectedItems.length} selecionados`}
          </span>
          <ChevronDownIcon className="-mr-1 sm:ml-2 h-5 w-5" aria-hidden="true" />
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
          className={`absolute thin-scrollbar cursor-pointer ${
            props.position ? props.position : "right"
          }-0 z-10 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto`}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div
                key={index}
                onClick={() => toggleSelect(item)}
                className={classNames(
                  "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 hover:text-gray-900",
                  isSelected(item) ? "font-medium text-indigo-600" : "text-gray-700"
                )}
              >
                {isSelected(item) && <CheckIcon className="w-4 h-4 mr-2 text-indigo-500" />}
                {!isSelected(item) && <span className="w-4 h-4 mr-2 border rounded-sm"></span>}
                <span className="pr-2">{getLabel(item)}</span>
                <span>{getLabelSecondary(item) !== "" && getLabelSecondary(item)}</span>
              </div>
            ))}
          </div>
        </div>
      </Transition>
    </Menu>
  )
}
