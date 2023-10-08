import React from 'react'

interface ICheckbox {
  options: string[]
  label: string
  visibleLabel?: boolean
  checked?: string
  handleCheckboxChange: (selectedOption: string) => void
}

export default function CheckboxUnique(props: ICheckbox) {
  const handleCheckboxChange = (selectedOption: string) => {
    props.handleCheckboxChange(selectedOption)
  }

  return (
    <div>
      <h3 className="my-2 font-semibold text-gray-900 ">{props.visibleLabel && props.label}</h3>
      <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex ">
        {props.options.map((option) => (
          <li key={option} className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
            <div className="flex items-center pl-3">
              <input
                id={`${props.label}-${option}`}
                type="radio"
                name={props.label} // Use a propriedade 'label' para criar um nome exclusivo para cada grupo de opções
                value={option}
                checked={props.checked === option} // Verifica se a opção é a selecionada
                className="w-4 h-4 cursor-pointer text-primary-200 bg-gray-100  border-gray-300 rounded focus:bg-primary-200 accent-primary-200"
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
