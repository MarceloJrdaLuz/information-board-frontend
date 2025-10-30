import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import ReactMarkdown from 'react-markdown';

interface ConsentModalProps {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    onAccept: () => void
    title?: string
    content?: string
    version?: string
}

export default function ConsentModal({
    isOpen,
    setIsOpen,
    onAccept,
    title,
    content,
    version
}: ConsentModalProps) {
    return (
        <Dialog
            open={isOpen}
            onClose={() => { }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
            <Dialog.Panel className="bg-white dark:bg-secondary-100 rounded-2xl shadow-lg w-[90%] max-w-lg p-6 flex flex-col gap-4 max-h-[80vh]">
                <div className="flex justify-between items-start gap-3">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </Dialog.Title>
                    <span>v.{version}</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo com scroll */}
                <Dialog.Description className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed overflow-y-auto max-h-[60vh]">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </Dialog.Description>
                <span>Para continuar usando o sistema, é necessário aceitar os termos de uso e a política de privacidade da congregação.</span>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-red-400 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Recusar
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-2 bg-primary-200 text-white rounded-md hover:bg-primary-100 transition"
                    >
                        Aceitar
                    </button>
                </div>
            </Dialog.Panel>

        </Dialog>
    )
}
