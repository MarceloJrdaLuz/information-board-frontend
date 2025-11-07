import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react"

interface FullNameShowProps {
  defaultName: string
}

export function FullNameShow({defaultName}: FullNameShowProps) {
  return (
    <Popover>
      <PopoverHandler>
        <Button className="shadow-none rounded-none hover:shadow-none h-fit text-typography-900 font-semi-bold p-1 text-start bg-transparent overflow-hidden whitespace-nowrap text-ellipsis border-b-2 border-dashed border-typography-900 w-full mr-3 capitalize font-medium text-sm">
         {defaultName}
        </Button>
      </PopoverHandler>
    </Popover>
  )
}