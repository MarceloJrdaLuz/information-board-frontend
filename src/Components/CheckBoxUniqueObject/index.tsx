import { ReactElement } from "react"

type Option = string | { value: string; label: string }

interface ICheckboxObject {
  options: Option[]
  full?: boolean
  label: string
  visibleLabel?: boolean
  checked?: string
  disabled?: boolean
  handleCheckboxChange: (selectedOption: string) => void
}


export default function CheckboxUniqueObject(props: ICheckboxObject) {
  const handleCheckboxChange = (selectedOption: string) => {
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
          const value = typeof option === "string" ? option : option.value
          const label = typeof option === "string" ? option : option.label
          const isChecked = props.checked === value

          return (
            <li
              key={value}
              className={`w-full ${!props.full && 'sm:w-1/2'} border-b sm:border-r border-surface-300 transition-colors ${
                isChecked ? 'bg-primary-200/5' : 'hover:bg-surface-200/50'
              }`}
            >
              <div className="flex items-center pl-3.5 py-1">
                <input
                  id={`${props.label}-${value}`}
                  type="radio"
                  name={props.label}
                  value={value}
                  checked={isChecked}
                  className="w-4 h-4 cursor-pointer text-primary-200 bg-surface-100 border-surface-300 focus:ring-primary-200 accent-primary-200"
                  onChange={() => props.handleCheckboxChange(value)}
                  disabled={props.disabled}
                />
                <label
                  htmlFor={`${props.label}-${value}`}
                  className="w-full py-2.5 ml-2.5 text-sm font-medium text-typography-800 cursor-pointer select-none"
                >
                  {label}
                </label>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
