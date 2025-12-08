import { Privileges } from "@/types/types";
import CheckboxMultiple from "../CheckBoxMultiple";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { ListFilterIcon } from "lucide-react";

interface IFilterPrivilegesProps {
  handleCheckboxChange: (selectedOptions: string[]) => void;
  onClick?: () => void;
  checkedOptions?: string[];
  includeOptionAll?: boolean;
}

export default function FilterPrivileges({
  handleCheckboxChange,
  checkedOptions,
  onClick,
  includeOptionAll,
}: IFilterPrivilegesProps) {
  const [privileges] = useState(
    includeOptionAll ? ["Todos", ...Object.values(Privileges)] : Object.values(Privileges)
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex hover:bg-transparent justify-center items-center text-primary-200 hover:text-primary-150 p-2"
          onClick={onClick}
        >
          <ListFilterIcon className="w-6 h-6 sm:w-6 sm:h-6" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 bg-surface-100 p-4">
        <div className="max-h-96 overflow-auto hide-scrollbar">
          <CheckboxMultiple
            full
            options={privileges}
            label="Filtrar"
            handleCheckboxChange={(selectedItems) => handleCheckboxChange(selectedItems)}
            checkedOptions={checkedOptions}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
