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
      <h3 className="my-2 font-semibold text-typography-900 ">
        {props.visibleLabel && props.label}
      </h3>
      <ul className="items-center justify-between flex-wrap text-sm font-medium text-typography-900 bg-surface-100 border border-typography-200 rounded-lg sm:flex ">
        {props.options.map((option) => {
          const value = typeof option === "string" ? option : option.value
          const label = typeof option === "string" ? option : option.label

          return (
            <li key={value} className={`w-full ${!props.full && 'sm:w-1/2'} border-b border-typography-200 sm:border-r`}>
              <div className="flex items-center pl-3">
                <input
                  id={`${props.label}-${value}`}
                  type="radio"
                  name={props.label}
                  value={value}
                  checked={props.checked === value}
                  className="w-4 h-4 cursor-pointer text-primary-200 bg-typography-100 border-typography-300 rounded focus:bg-primary-200 accent-primary-200"
                  onChange={() => props.handleCheckboxChange(value)}
                  disabled={props.disabled}
                />
                <label
                  htmlFor={`${props.label}-${value}`}
                  className="w-full py-3 ml-2 text-sm font-medium text-typography-900"
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
