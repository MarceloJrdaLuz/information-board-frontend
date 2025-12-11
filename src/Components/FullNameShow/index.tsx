import * as Popover from "@radix-ui/react-popover";
import { Button } from "../ui/button";

interface FullNameShowProps {
  defaultName: string;
}

export function FullNameShow({ defaultName }: FullNameShowProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="shadow-none rounded-none hover:shadow-none h-fit text-typography-900 font-semibold p-1 text-start bg-transparent overflow-hidden whitespace-nowrap text-ellipsis border-b-2 border-dashed border-typography-900 w-full mr-3 capitalize text-sm">
          {defaultName}
        </button>
      </Popover.Trigger>

      <Popover.Content side="bottom" align="start" className="bg-white rounded-md shadow-lg p-2">
        {/* Aqui você pode colocar conteúdo extra se quiser mostrar algo ao clicar */}
        {defaultName}
      </Popover.Content>
    </Popover.Root>
  );
}
