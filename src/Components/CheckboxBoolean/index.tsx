import React, { useEffect, useState } from 'react'

interface ICheckbox {
  label: string
  checked?: boolean
  handleCheckboxChange: (checked: boolean) => void
}

export default function CheckboxBoolean(props: ICheckbox) {
  const [checked, setChecked] = useState<boolean>(props.checked ?? false)

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
    <div className='flex items-center gap-2.5 py-1.5'>
      <input
        type="checkbox"
        id={`checkbox-bool-${props.label}`}
        checked={checked ?? false}
        onChange={(e) => handleCheckboxChange(e.target.checked)}
        className="w-4 h-4 cursor-pointer text-primary-200 bg-surface-100 border border-surface-300 rounded focus:ring-primary-200 accent-primary-200"
      />
      <label htmlFor={`checkbox-bool-${props.label}`} className='text-sm font-medium text-typography-800 cursor-pointer select-none'>
        {props.label}
      </label>
    </div>
  )
}
