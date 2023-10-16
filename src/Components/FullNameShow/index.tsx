import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
} from "@material-tailwind/react";

interface FullNameShowProps {
  defaultName: string
  fullName: string
}

export function FullNameShow({defaultName, fullName}: FullNameShowProps) {
  return (
    <Popover>
      <PopoverHandler>
        <Button className="shadow-none rounded-none hover:shadow-none h-fit text-gray-900 font-semi-bold p-1 text-start bg-transparent overflow-hidden whitespace-nowrap text-ellipsis border-b-2 border-dashed border-black w-full mr-3 capitalize font-medium text-sm">
         {defaultName}
        </Button>
      </PopoverHandler>
      <PopoverContent>
       {fullName}
      </PopoverContent>
    </Popover>
  );
}