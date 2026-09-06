import { IGroup } from '@/types/types'

interface ICheckboxGroupsProps {
  full?: boolean
  options: IGroup[]
  label: string
  visibleLabel?: boolean
  checkedOptions?: string[] // torna a propriedade opcional
  handleCheckboxChange: (selectedOptions: string[]) => void
}

export default function CheckboxGroups(props: ICheckboxGroupsProps) {
  const handleCheckboxChange = (id: string) => {
    const isChecked = props.checkedOptions?.includes(id) || false
    let updatedOptions: string[]

    if (isChecked) {
      updatedOptions = props.checkedOptions?.filter((option) => option !== id) || []
    } else {
      updatedOptions = [...props.checkedOptions || [], id]
    }

    props.handleCheckboxChange(updatedOptions)
  }

  return (
    <div>
      {props.visibleLabel && (
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
          {props.label}
        </h3>
      )}
      <ul className="items-center justify-between flex-wrap text-sm font-medium text-typography-800 bg-surface-100 border border-surface-300 rounded-xl overflow-hidden shadow-xs sm:flex">
        {props.options.length > 0 ? props.options.map((option) => {
          const isChecked = props.checkedOptions?.includes(option.id) || false
          return (
            <li
              key={option.id}
              className={`w-full ${!props.full && 'sm:w-1/2'} border-b sm:border-r border-surface-300 transition-colors ${
                isChecked ? 'bg-primary-200/5' : 'hover:bg-surface-200/50'
              }`}
            >
              <div className="flex items-center pl-3.5 py-1">
                <input
                  id={`${props.label}-${option.id}`}
                  type="checkbox"
                  name={props.label}
                  value={option.id}
                  className="w-4 h-4 cursor-pointer text-primary-200 bg-surface-100 border-surface-300 rounded focus:ring-primary-200 accent-primary-200"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(option.id)}
                />
                <label
                  htmlFor={`${props.label}-${option.id}`}
                  className="w-full py-2.5 ml-2.5 text-sm font-medium text-typography-800 cursor-pointer select-none"
                >
                  {`Grupo: ${option.number} (${option.groupOverseers.fullName})`}
                </label>
              </div>
            </li>
          )
        }) : (
          <span className='p-3 text-center text-sm text-typography-500 w-full'>Não há grupos!</span>
        )}
      </ul>
    </div>
  )
}
