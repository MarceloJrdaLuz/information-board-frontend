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
        <h3 className="my-4 font-semibold text-typography-700">
          {props.label}
        </h3>
      )}

      <ul
        className="
          flex flex-wrap items-center justify-between 
          bg-surface-100 border rounded-lg 
          text-sm font-medium text-foreground
        "
      >
        {props.options.map((option) => (
          <li
            key={option}
            className={`w-full ${!props.full && "sm:w-1/2"
              } border-b sm:border-r border-border`}
          >
            <div className="flex items-center gap-2 pl-3 py-3">
              <Checkbox
              className="border-[2px] border-typography-600 bg-surface-100 data-[state=checked]:bg-surface-100 data-[state=checked]:text-primary-200 data-[state=checked]:border-primary-200"
                id={`${props.label}-${option}`}
                checked={props.checkedOptions?.includes(option) || false}
                onCheckedChange={() => handleCheckboxChange(option)}
              />

              <label
                htmlFor={`${props.label}-${option}`}
                className="text-sm font-semibold text-typography-900 cursor-pointer"
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
