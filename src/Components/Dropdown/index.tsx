import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}



interface IDropdown {
  title: string | undefined
  options: string[] 
  handleClick: (option: string) => void
  border?: boolean
  full?: boolean
}

export default function Dropdown(props: IDropdown) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button className={`inline-flex w-full justify-center rounded-md  bg-transparent border px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-100 ${props.border ? "border border-blue-gray-200": "border-none"} `}>
          {props.title}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute cursor-pointer right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto" >
          <div className="py-1">
            {props.options.map((option, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <span
                    onClick={() => props.handleClick(option)}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {option}
                  </span>
                )}
              </Menu.Item>)
              )}
            {/* <form method="POST" action="#">
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="submit"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-sm'
                    )}
                  >
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </form> */}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
