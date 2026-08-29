import getCroppedImg, { Area } from "@/utils/cropImage"
import { AnimatePresence, motion } from "framer-motion"
import { Check, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react"
import { useState } from "react"
import Cropper from "react-easy-crop"
import { Button } from "../ui/button"

interface AvatarCropModalProps {
    isOpen: boolean
    imageSrc: string | null
    onClose: () => void
    onSave: (croppedFile: File) => Promise<void> | void
}

export default function AvatarCropModal({
    isOpen,
    imageSrc,
    onClose,
    onSave
}: AvatarCropModalProps) {
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState<number>(1)
    const [rotation, setRotation] = useState<number>(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsSaving(true)
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
            if (croppedFile) {
                await onSave(croppedFile)
            }
            onClose()
        } catch (error) {
            console.error("Erro ao cortar a imagem:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    if (!isOpen || !imageSrc) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-md bg-surface-100 rounded-2xl shadow-2xl border border-surface-300 overflow-hidden flex flex-col"
                >
                    {/* Header do Modal */}
                    <div className="px-5 py-4 border-b border-surface-300 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-typography-800">
                                Ajustar Foto de Perfil
                            </h3>
                            <p className="text-xs text-typography-500">
                                Arraste e dê zoom para enquadrar seu rosto
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="p-1.5 rounded-full hover:bg-surface-200 text-typography-500 hover:text-typography-800 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Área Interativa de Corte do Avatar */}
                    <div className="relative w-full h-72 sm:h-80 bg-typography-900 overflow-hidden">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            classes={{
                                containerClassName: "cursor-grab active:cursor-grabbing",
                                cropAreaClassName: "border-2 border-primary-200 shadow-2xl"
                            }}
                        />
                    </div>

                    {/* Controles de Zoom e Rotação */}
                    <div className="p-4 bg-surface-100 border-t border-surface-300 space-y-3">
                        {/* Controle de Zoom */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                                className="p-1.5 rounded-lg hover:bg-surface-200 text-typography-600 transition"
                                title="Diminuir zoom"
                            >
                                <ZoomOut size={18} />
                            </button>

                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1 accent-primary-200 h-2 bg-surface-300 rounded-lg cursor-pointer"
                            />

                            <button
                                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                                className="p-1.5 rounded-lg hover:bg-surface-200 text-typography-600 transition"
                                title="Aumentar zoom"
                            >
                                <ZoomIn size={18} />
                            </button>

                            <button
                                onClick={handleRotate}
                                className="p-2 rounded-xl bg-surface-200 hover:bg-surface-300 text-typography-700 transition flex items-center gap-1 text-xs font-semibold"
                                title="Girar 90°"
                            >
                                <RotateCw size={15} />
                                <span className="hidden sm:inline">Girar</span>
                            </button>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSaving}
                                className="w-1/2 rounded-xl text-xs sm:text-sm font-semibold"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-1/2 rounded-xl bg-primary-200 hover:bg-primary-150 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md"
                            >
                                <Check size={16} />
                                <span>{isSaving ? "Salvando..." : "Salvar Foto"}</span>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

