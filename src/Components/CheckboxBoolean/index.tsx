import React, { useEffect, useState } from 'react'

interface ICheckbox {
  label: string
  checked?: boolean
  handleCheckboxChange: (checked: boolean) => void
}

export default function CheckboxBoolean(props: ICheckbox) {
  const [checked, setChecked] = useState(props.checked || false)

  useEffect(()=> {
    if (props.checked !== undefined) {
      setChecked(props.checked)
    }
  }, [props.checked])

  const handleCheckboxChange = (checked: boolean) => {
    setChecked(checked)
    props.handleCheckboxChange(checked)
  }

  return (
    <div className='flex justify-end items-center'>
      <label className="flex justify-end items-center">
      </label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
        className="w-4 h-4 cursor-pointer text-primary-200 bg-gray-100 border-gray-300 rounded focus:bg-primary-200 accent-primary-200  mr-2"
      />
      <span className='text-sm text-gray-800'>{props.label}</span>
    </div>
  )
}
