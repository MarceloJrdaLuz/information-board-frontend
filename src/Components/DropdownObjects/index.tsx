import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

interface IDropdown {
  title: string | undefined;
  items: any[]; // Deixaremos o tipo genérico para o TypeScript inferir automaticamente
  selectedItem: any | null; // Deixaremos o tipo genérico para o TypeScript inferir automaticamente
  handleChange: (item: any | null) => void; // Deixaremos o tipo genérico para o TypeScript inferir automaticamente
  border?: boolean;
  full?: boolean;
  position?: 'right' | 'left';
  textVisible?: boolean;
  labelKey?: string; // Agora, aceitaremos uma string como labelKey
}

export default function Dropdown(props: IDropdown) {
  const { items, selectedItem } = props;

  const getLabel = (item: any): string => {
    if (props.labelKey && item[props.labelKey]) {
      return String(item[props.labelKey]);
    }
    return String(item);
  };

  return (
    <Menu as="div" className={`relative inline-block text-left ${props.full && "w-full"}`}>
      <div>
        <Menu.Button className={`inline-flex w-full justify-center rounded-md  bg-transparent border px-3 md:px-4 py-2 text-sm font-medium text-gray-700  hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-100 ${props.border ? "border border-blue-gray-200" : "border-none"}`}>
          <span className={`${!props.textVisible && 'hidden'} sm:flex`}>
            {selectedItem ? getLabel(selectedItem) : props.title}
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
        <Menu.Items className={`absolute cursor-pointer ${props.position}-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none h-fit max-h-80 overflow-auto`}>
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
                    {getLabel(item)}
                  </span>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
