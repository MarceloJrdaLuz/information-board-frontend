import { ReactElement } from 'react'

interface ICheckbox {
  options: string[]
  full?: boolean
  label: string
  visibleLabel?: boolean
  checked?: string
  disabled?: boolean
  handleCheckboxChange: (selectedOption: string) => void
  children?: ReactElement | null
}

export default function CheckboxUnique(props: ICheckbox) {
  const handleCheckboxChange = (selectedOption: string) => {
    props.handleCheckboxChange(selectedOption)
  }

  return (
    <div>
      <h3 className="my-2 font-semibold text-typography-900 ">{props.visibleLabel && props.label}</h3>
      <ul className="items-center justify-between flex-wrap text-sm font-medium text-typography-900 bg-surface-100 border border-typography-200 rounded-lg sm:flex ">
        {props.options.map((option) => (
          <li key={option} className={`w-full ${!props.full && 'sm:w-1/2'} border-b border-typography-200  sm:border-r`}>
            <div className="flex items-center pl-3">
              <input
                id={`${props.label}-${option}`}
                type="radio"
                name={props.label} 
                value={option}
                checked={props.checked === option} // Verifica se a opção é a selecionada
                className="w-4 h-4 cursor-pointer text-primary-200 bg-surface-100  border-typography-300 rounded focus:bg-primary-200 accent-primary-200"
                onChange={() => handleCheckboxChange(option)}
                disabled={props.disabled}
              />
              <label
                htmlFor={`${props.label}-${option}`}
                className="w-full py-3 ml-2 text-sm font-medium text-typography-900"
              >
                {option}
              </label>
            </div>
          </li>
        ))}
        {props.children}
      </ul>
    </div>
  )
}
