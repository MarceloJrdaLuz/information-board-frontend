import Image from 'next/image'
import { useState } from 'react'

interface FullScreenImageProps {
    src: string
    alt: string
}

const FullScreenImage: React.FC<FullScreenImageProps> = ({ src, alt }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleImageClick = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    return (
        <div className="relative w-full h-full justify-center items-center">
            {/* Imagem Original */}
            <div className="cursor-pointer" onClick={handleImageClick}>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain"
                />
            </div>

            {/* Modal com Imagem em Tela Cheia */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-typography-900 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="relative w-full h-full">
                        {/* Botão de Fechar */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-white text-3xl font-bold"
                        >
                            ×
                        </button>
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            style={{objectFit: "contain"}}
                            className="cursor-pointer"
                            onClick={handleCloseModal} // Fecha ao clicar na imagem
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default FullScreenImage
