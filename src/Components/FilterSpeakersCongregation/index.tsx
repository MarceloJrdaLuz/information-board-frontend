import { sortArrayByProperty } from "@/functions/sortObjects";
import { ICongregation } from "@/types/types";
import { formatNameCongregation } from "@/utils/formatCongregationName";
import * as Popover from "@radix-ui/react-popover";
import { ListFilterIcon } from "lucide-react";
import CheckboxUniqueObject from "../CheckBoxUniqueObject";

interface FilterSpeakersCongregationProps {
  handleCheckboxChange: (selectedCongregation: ICongregation | null) => void;
  onClick?: () => void;
  checkedOptions?: string;
  congregations: ICongregation[];
}

export default function FilterSpeakersCongregation({
  handleCheckboxChange,
  checkedOptions,
  onClick,
  congregations,
}: FilterSpeakersCongregationProps) {
  const sortedCongregations = sortArrayByProperty(congregations, "name");

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          onClick={onClick}
          className="bg-transparent border-none shadow-none text-primary-200 hover:text-primary-150 font-bold p-5 flex items-center justify-center"
        >
          <ListFilterIcon />
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        className="w-80 bg-surface-100 rounded-md shadow-lg p-4 max-h-96 overflow-auto hide-scrollbar"
      >
        <span className="text-typography-200 text-sm mb-2 block">
          Congregação / Cidade
        </span>
        <CheckboxUniqueObject
          options={[
            { value: "", label: "Todas as congregações" },
            ...sortedCongregations.map((c) => ({
              value: c.id,
              label: formatNameCongregation(c.name, c.city),
            })),
          ]}
          label="Congregação"
          checked={checkedOptions}
          handleCheckboxChange={(selectedId) => {
            if (!selectedId) {
              handleCheckboxChange(null);
            } else {
              const selectedCongregation = sortedCongregations.find(
                (c) => c.id === selectedId
              );
              handleCheckboxChange(selectedCongregation || null);
            }
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
