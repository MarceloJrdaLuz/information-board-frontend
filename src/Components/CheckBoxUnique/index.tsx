import { ReactElement } from 'react'

interface ICheckbox {
  options: string[]
  full?: boolean
  label: string
  visibleLabel?: boolean
  checked?: string
  allowUncheck?: boolean
  disabled?: boolean
  handleCheckboxChange: (selectedOption: string) => void
  children?: ReactElement | null
}

export default function CheckboxUnique(props: ICheckbox) {
  const handleCheckboxChange = (selectedOption: string) => {
    if (
      props.allowUncheck &&
      props.checked === selectedOption
    ) {
      props.handleCheckboxChange("")
      return
    }

    props.handleCheckboxChange(selectedOption)
  }

  return (
    <div>
      {props.visibleLabel && (
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
          {props.label}
        </h3>
      )}
      <ul className="items-center justify-between flex-wrap text-sm font-medium text-typography-800 bg-surface-100 border border-surface-300 rounded-xl overflow-hidden shadow-xs sm:flex">
        {props.options.map((option) => {
          const isChecked = props.checked === option
          return (
            <li
              key={option}
              className={`w-full ${!props.full && 'sm:w-1/2'} border-b sm:border-r border-surface-300 transition-colors ${
                isChecked ? 'bg-primary-200/5' : 'hover:bg-surface-200/50'
              }`}
            >
              <div className="flex items-center pl-3.5 py-1">
                <input
                  id={`${props.label}-${option}`}
                  type="radio"
                  name={props.label}
                  value={option}
                  checked={isChecked}
                  className="w-4 h-4 cursor-pointer text-primary-200 bg-surface-100 border-surface-300 focus:ring-primary-200 accent-primary-200"
                  onClick={() => handleCheckboxChange(option)}
                  onChange={() => { }}
                  disabled={props.disabled}
                />
                <label
                  htmlFor={`${props.label}-${option}`}
                  className="w-full py-2.5 ml-2.5 text-sm font-medium text-typography-800 cursor-pointer select-none"
                >
                  {option}
                </label>
              </div>
            </li>
          )
        })}
        {props.children}
      </ul>
    </div>
  )
}
