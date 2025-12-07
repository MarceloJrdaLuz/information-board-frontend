import { IPublisher } from "@/types/types";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { ChevronDownIcon, CopyCheck, CopyIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils"; // Função utilitária para concatenar classes, opcional

interface MissingReportsModalProps {
  missingReportsNumber: number;
  missingReports: IPublisher[] | undefined;
}

export default function MissingReportsModal({
  missingReportsNumber,
  missingReports,
}: MissingReportsModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = () => {
    if (missingReports && missingReports.length > 0) {
      const dataToCopy = missingReports.map((r) => r.fullName).join("\n");
      navigator.clipboard.writeText(dataToCopy);
      setCopySuccess(true);

      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className="bg-transparent border-none shadow-none text-primary-200 font-bold w-48 whitespace-nowrap flex justify-between items-center"
        >
          {`Relatórios em falta: ${missingReportsNumber}`}
          <ChevronDownIcon />
        </Button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="end"
        className="w-72 bg-surface-100 text-typography-800 rounded-md shadow-md p-2"
      >
        <div className="w-full flex justify-end cursor-pointer mb-2">
          {copySuccess ? (
            <div className="flex justify-center items-center gap-1">
              <span className="text-success-100 text-sm">Copiado com sucesso!</span>
              <CopyCheck className="text-success-100 p-0.5" />
            </div>
          ) : (
            <CopyIcon className="p-0.5 cursor-pointer" onClick={handleCopyToClipboard} />
          )}
        </div>

        <ul className="p-0 max-h-96 overflow-auto hide-scrollbar">
          {missingReports && missingReports.length > 0 ? (
            missingReports.map((missingReport) => (
              <li key={missingReport.id} className="py-1 px-2 border-b last:border-b-0">
                {missingReport.fullName}
              </li>
            ))
          ) : (
            <li className="py-1 px-2">Todos os relatórios enviados</li>
          )}
        </ul>
      </Popover.Content>
    </Popover.Root>
  );
}
