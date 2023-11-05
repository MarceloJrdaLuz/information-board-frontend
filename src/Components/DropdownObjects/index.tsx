import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

interface IDropdown<T> {
  title: string | undefined
  items: T[] // Use o tipo genérico T para os itens
  selectedItem: T | null // Use o tipo genérico T para o item selecionado
  handleChange: (item: T | null) => void
  border?: boolean
  full?: boolean
  position?: 'right' | 'left'
  textVisible?: boolean
  textAlign?: 'right' | 'left' | 'center'
  labelKey?: keyof T // Chave para determinar a propriedade a ser usada como rótulo
  labelKeySecondary?: keyof T // Chave para determinar a propriedade a ser usada como rótulo
}

export default function DropdownObject<T>(props: IDropdown<T>) {
  const { items, selectedItem } = props

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
    return String("")
  }

  return (
    <Menu as="div" className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button className={`inline-flex w-full justify-${props.textAlign ? `${props.textAlign}` : `center`} rounded-md  bg-transparent border px-3 md:px-4 py-2 font-medium text-gray-700  hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-100 ${props.border ? "border border-blue-gray-200" : "border-none"}`}>
          <span className={`${!props.textVisible && 'hidden'} sm:flex`}>
            {selectedItem ? (
              <>
                <span className='pr-2'>{getLabel(selectedItem)}</span>
                <span>{getLabelSecondary(selectedItem) !== "" && getLabelSecondary(selectedItem)}</span>
              </>
            ) : props.title}
          </span>
          <ChevronDownIcon className="-mr-1 sm:ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className={`absolute thin-scrollbar cursor-pointer ${props.position}-0 z-10 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto`}>
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <span
                    onClick={() => props.handleChange(item)}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    <span className='pr-2'>{getLabel(item)}</span>
                    <span>{getLabelSecondary(item) !== "" && getLabelSecondary(item)}</span>
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
