import { Checkbox } from "../ui/checkbox"

interface ICheckboxMultiple {
  full?: boolean
  options: string[]
  label: string
  visibleLabel?: boolean
  checkedOptions?: string[]
  handleCheckboxChange: (selectedOptions: string[]) => void
}

export default function CheckboxMultiple(props: ICheckboxMultiple) {
  const handleCheckboxChange = (selectedOption: string) => {
    const isChecked = props.checkedOptions?.includes(selectedOption) || false

    const updatedOptions = isChecked
      ? props.checkedOptions?.filter((o) => o !== selectedOption) || []
      : [...(props.checkedOptions || []), selectedOption]

    props.handleCheckboxChange(updatedOptions)
  }

  return (
    <div>
      {props.visibleLabel && (
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-typography-600">
          {props.label}
        </h3>
      )}

      <ul className="flex flex-wrap items-center justify-between bg-surface-100 border border-surface-300 rounded-xl overflow-hidden shadow-xs text-sm font-medium text-typography-800">
        {props.options.map((option) => {
          const isChecked = props.checkedOptions?.includes(option) || false
          return (
            <li
              key={option}
              className={`w-full ${!props.full && "sm:w-1/2"} border-b sm:border-r border-surface-300 transition-colors ${
                isChecked ? 'bg-primary-200/5' : 'hover:bg-surface-200/50'
              }`}
            >
              <div className="flex items-center gap-2.5 pl-3.5 py-2.5">
                <Checkbox
                  className="border border-surface-300 bg-surface-100 data-[state=checked]:bg-primary-200 data-[state=checked]:text-white data-[state=checked]:border-primary-200"
                  id={`${props.label}-${option}`}
                  checked={isChecked}
                  onCheckedChange={() => handleCheckboxChange(option)}
                />
                <label
                  htmlFor={`${props.label}-${option}`}
                  className="text-sm font-medium text-typography-800 cursor-pointer select-none"
                >
                  {option}
                </label>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
