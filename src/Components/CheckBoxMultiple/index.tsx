import React from 'react'

interface ICheckboxMultiple {
  options: string[]
  label: string
  visibleLabel?: boolean
  checkedOptions?: string[] // torna a propriedade opcional
  handleCheckboxChange: (selectedOptions: string[]) => void
}

export default function CheckboxMultiple(props: ICheckboxMultiple) {
  const handleCheckboxChange = (selectedOption: string) => {
    const isChecked = props.checkedOptions?.includes(selectedOption) || false
    let updatedOptions: string[]

    if (isChecked) {
      updatedOptions = props.checkedOptions?.filter((option) => option !== selectedOption) || []
    } else {
      updatedOptions = [...(props.checkedOptions || []), selectedOption]
    }

    props.handleCheckboxChange(updatedOptions)
  }

  return (
    <div>
      <h3 className="mb-4 font-semibold text-gray-900 ">{props.visibleLabel && props.label}</h3>
      <ul className="items-center justify-between flex-wrap text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex">
        {props.options.map((option) => (
          <li key={option} className=" w-1/2 border-b border-gray-200 sm:border-b-0 sm:border-r">
            <div className="flex items-center pl-3">
              <input
                id={`${props.label}-${option}`}
                type="checkbox"
                name={props.label}
                value={option}
                className="w-4 h-4 cursor-pointer text-primary-200 bg-gray-100 border-gray-300 rounded focus:bg-primary-200 accent-primary-200"
                checked={props.checkedOptions?.includes(option) || false}
                onChange={() => handleCheckboxChange(option)}
              />
              <label
                htmlFor={`${props.label}-${option}`}
                className="w-full py-3 ml-2 text-sm font-medium text-gray-900"
              >
                {option}
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
