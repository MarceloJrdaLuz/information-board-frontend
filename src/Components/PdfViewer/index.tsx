import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    ZoomIn,
    ZoomOut
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useSwipeable } from 'react-swipeable'
import Spiner from '../Spiner'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfViewerProps {
    url: string
    initialPage?: number
    isCurrentWeek?: boolean
    title?: string
    setPdfShow: (show: boolean) => void
}

export default function PdfViewer({
    url,
    setPdfShow,
    initialPage = 1,
    isCurrentWeek,
    title
}: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState<number>(initialPage)
    const [scale, setScale] = useState<number>(1.0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [containerWidth, setContainerWidth] = useState<number>(800)

    const viewerRef = useRef<HTMLDivElement>(null)

    // Ajusta a largura da página baseando-se no tamanho da tela
    useEffect(() => {
        const updateWidth = () => {
            if (viewerRef.current) {
                const width = viewerRef.current.clientWidth
                setContainerWidth(Math.min(width - 32, 900))
            } else if (typeof window !== 'undefined') {
                setContainerWidth(Math.min(window.innerWidth - 32, 900))
            }
        }

        updateWidth()
        window.addEventListener('resize', updateWidth)
        return () => window.removeEventListener('resize', updateWidth)
    }, [])

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages)
        setIsLoading(false)

        if (initialPage > numPages) {
            setPageNumber(1)
        }
    }

    const handlePrevPage = () => {
        if (pageNumber > 1) {
            setPageNumber((prev) => prev - 1)
        }
    }

    const handleNextPage = () => {
        if (numPages && pageNumber < numPages) {
            setPageNumber((prev) => prev + 1)
        }
    }

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 2.4))
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.6))
    }

    const handleResetZoom = () => {
        setScale(1.0)
    }

    // Gestos de swipe para trocar de página no celular
    const handlers = useSwipeable({
        onSwipedLeft: () => handleNextPage(),
        onSwipedRight: () => handlePrevPage(),
        trackMouse: false,
        preventScrollOnSwipe: true
    })

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-typography-950 text-white select-none overflow-hidden animate-fadeIn">
            {/* Header / Barra de Ferramentas Superior */}
            <header className="shrink-0 bg-typography-900/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-lg z-30">
                {/* Botão Voltar */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPdfShow(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-semibold transition active:scale-95 text-white"
                        title="Fechar visualizador"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Voltar</span>
                    </button>

                    {title && (
                        <span className="text-xs sm:text-sm font-medium text-typography-300 truncate max-w-[140px] sm:max-w-xs ml-1">
                            {title}
                        </span>
                    )}
                </div>

                {/* Controles de Navegação de Página (Central) */}
                <div className="flex items-center gap-1 sm:gap-2 bg-black/40 px-2 sm:px-3 py-1 rounded-xl border border-white/10">
                    <button
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1 || isLoading}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition"
                        title="Página anterior"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="text-xs sm:text-sm font-semibold px-1 min-w-[75px] sm:min-w-[90px] text-center tracking-tight text-typography-200">
                        {isLoading
                            ? "Carregando..."
                            : `${pageNumber} / ${numPages || 1}`}
                    </span>

                    <button
                        onClick={handleNextPage}
                        disabled={!numPages || pageNumber >= numPages || isLoading}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition"
                        title="Próxima página"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Controles de Zoom e Ações Rápidas (Direita) */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* Zoom Out */}
                    <button
                        onClick={handleZoomOut}
                        disabled={scale <= 0.6}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-typography-200 disabled:opacity-30 transition hidden sm:inline-flex"
                        title="Diminuir Zoom"
                    >
                        <ZoomOut size={16} />
                    </button>

                    {/* Porcentagem / Reset */}
                    <button
                        onClick={handleResetZoom}
                        className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-typography-200 transition hidden sm:inline-flex"
                        title="Restaurar Zoom (100%)"
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    {/* Zoom In */}
                    <button
                        onClick={handleZoomIn}
                        disabled={scale >= 2.4}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-typography-200 disabled:opacity-30 transition hidden sm:inline-flex"
                        title="Aumentar Zoom"
                    >
                        <ZoomIn size={16} />
                    </button>

                    {/* Baixar PDF */}
                    <a
                        href={url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition active:scale-95"
                        title="Baixar PDF"
                    >
                        <Download size={15} />
                        <span className="hidden md:inline">Baixar</span>
                    </a>
                </div>
            </header>

            {/* Badge de "Semana Atual" em destaque */}
            {isCurrentWeek && pageNumber === initialPage && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="bg-primary-200 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1.5 animate-bounce">
                        <Calendar size={13} />
                        <span>Semana Atual</span>
                    </div>
                </div>
            )}

            {/* Área Central de Visualização com Scroll Suave */}
            <div
                ref={viewerRef}
                className="flex-1 w-full overflow-auto flex justify-center items-start p-3 sm:p-6 md:p-8 scroll-smooth"
            >
                <div
                    {...handlers}
                    className="flex flex-col items-center justify-center min-h-full py-2 w-full"
                >
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-typography-400">
                                <Spiner />
                                <span className="text-xs font-medium tracking-wide">
                                    Carregando documento...
                                </span>
                            </div>
                        }
                        error={
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center max-w-sm text-red-400 text-sm">
                                Não foi possível carregar o arquivo PDF. Verifique sua conexão ou tente baixar o arquivo diretamente.
                            </div>
                        }
                    >
                        <div className="shadow-2xl rounded-lg overflow-hidden border border-white/10 bg-white transition-transform duration-150">
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                width={containerWidth}
                                scale={scale}
                                className="overflow-hidden"
                            />
                        </div>
                    </Document>
                </div>
            </div>

            {/* Barra Flutuante de Atalhos Rápidos para Celular (Bottom Bar) */}
            <footer className="sm:hidden shrink-0 bg-typography-900/95 backdrop-blur-md border-t border-white/10 px-4 py-2 flex items-center justify-between gap-3 shadow-lg z-30">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={scale <= 0.6}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition"
                        title="Diminuir Zoom"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="text-xs font-bold px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                    >
                        {Math.round(scale * 100)}%
                    </button>
                    <button
                        onClick={handleZoomIn}
                        disabled={scale >= 2.4}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition"
                        title="Aumentar Zoom"
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1 || isLoading}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-semibold flex items-center gap-1"
                    >
                        <ChevronLeft size={15} />
                        <span>Ant.</span>
                    </button>

                    <button
                        onClick={handleNextPage}
                        disabled={!numPages || pageNumber >= numPages || isLoading}
                        className="px-3 py-1.5 rounded-xl bg-primary-200 hover:bg-primary-150 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                        <span>Próx.</span>
                        <ChevronRight size={15} />
                    </button>
                </div>
            </footer>
        </div>
    )
}