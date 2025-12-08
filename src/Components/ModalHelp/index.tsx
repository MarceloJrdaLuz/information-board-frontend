import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { XSquareIcon } from "lucide-react";

interface ModalHelpProps {
  title?: string;
  text?: string;
  onClick?: () => void;
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function ModalHelp({ title, text, onClick, open, setOpen }: ModalHelpProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="mt-6 w-full max-w-[700px] h-5/6 overflow-auto thin-scrollbar">
        <div className="flex justify-between items-start mb-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </div>
        <DialogDescription>
          <span className="whitespace-pre-wrap">{text}</span>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
