import { IGroup } from '@/entities/types'
import React from 'react'

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
      <h3 className="my-2 font-semibold text-gray-900 ">{props.visibleLabel && props.label}</h3>
      <ul className="items-center justify-between flex-wrap text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex">
        {props.options.length > 0 ? props.options.map((option) => (
          <li key={option.id} className={`w-full ${!props.full && 'sm:w-1/2'} border-b border-gray-200  sm:border-r `}>
            <div className="flex items-center pl-3">
              <input
                id={`${props.label}-${option.id}`}
                type="checkbox"
                name={props.label}
                value={option.id}
                className="w-4 h-4 cursor-pointer text-primary-200 bg-gray-100 border-gray-300 rounded focus:bg-primary-200 accent-primary-200"
                checked={props.checkedOptions?.includes(option.id) || false}
                onChange={() => handleCheckboxChange(option.id)}
              />
              <label
                htmlFor={`${props.label}-${option}`}
                className="w-full py-3 ml-2 text-sm font-medium text-gray-900"
              >
                {`Grupo: ${option.number} (${option.groupOverseers.fullName})`}
              </label>
            </div>
          </li>
        )) : (
          <span className='p-2 text-center'>Não há grupos!</span>
        )}
      </ul>
    </div>
  )
}
