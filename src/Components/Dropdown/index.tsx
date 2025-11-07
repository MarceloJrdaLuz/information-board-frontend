import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}
interface IDropdown {
  title: string | undefined
  options: string[]
  selectedItem?: string | null // Use o tipo genérico T para o item selecionado
  handleClick: (option: string) => void
  onClick?: () => void
  border?: boolean
  full?: boolean
  position?: 'right' | 'left'
  textAlign?: 'right' | 'left' | 'center'
  textSize?: 'md' | 'lg' | 'xl'
  textVisible?: boolean
  notBorderFocus?: boolean
}

export default function Dropdown(props: IDropdown) {

  return (
    <Menu as="div" className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button onClick={props.onClick} className={`inline-flex w-full  justify-${props.textAlign ? `${props.textAlign}` : `center`} rounded-md  bg-transparent border px-3 md:px-4 py-2 text-${props.textSize ? props.textSize : "sm"} font-medium text-typography-400  hover:underline focus:outline-none  ${props.border ? "border border-blue-gray-200" : "border-none"} ${!props.notBorderFocus && "focus:ring-1  focus:ring-offset-1 focus:ring-offset-primary-200"}`}>
          <span className={`${!props.textVisible && 'hidden'} sm:flex`}>
            {props.selectedItem ? props.selectedItem : props.title}
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
        <Menu.Items className={`absolute thin-scrollbar cursor-pointer ${props.position}-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-surface-100 shadow-lg ring-1 ring-typography-900 ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto`} >
          <div className="py-1">
            {props.options.map((option, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <span
                    onClick={() => props.handleClick(option)}
                    className={classNames(
                      active ? 'bg-surface-200 text-typography-800' : 'text-typography-800',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {option}
                  </span>
                )}
              </Menu.Item>)
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
