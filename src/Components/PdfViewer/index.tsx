import { handleTouchSwipe } from '@/helpers/handleTouchSwipe';
import { ChevronLeftIcon, ChevronRightIcon,  Undo2Icon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Spiner from '../Spiner';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfViewerProps {
    url: string
    setPdfShow: React.Dispatch<boolean>
}

export default function PdfViewer({ url, setPdfShow }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const touchStartX = useRef<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const lastPage = numPages
    const firstPage = numPages! - numPages! + 1

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setIsLoading(false);
    }

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        if (event.touches.length > 0) {
            touchStartX.current = event.touches[0].clientX;
        }
    }

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX.current && event.changedTouches.length > 0) {
            const newPageNumber = handleTouchSwipe(
                touchStartX.current,
                pageNumber,
                numPages || 0,
                event.changedTouches[0].clientX < touchStartX.current ? 'left' : 'right',
                event // Passa o objeto event como argumento
            );

            setPageNumber(newPageNumber);
            touchStartX.current = null;
        }
    };

    return (

        <div className='flex flex-col justify-start items-center w-screen h-screen lg:p-5 overflow-auto bg-gray-900 '>
            <div className='mb-4'>
                {!isLoading && (
                    <div className='flex justify-center items-center gap-4 m-4 text-secondary-100'>
                        <Undo2Icon className='cursor-pointer hover:text-primary-100' onClick={() => setPdfShow(false)}/>
                        <ChevronLeftIcon className='cursor-pointer hover:text-primary-100' onClick={() => { pageNumber > 1 ? setPageNumber(pageNumber - 1) : setPageNumber(lastPage!) }} />
                        <span>
                            Página {pageNumber} / {numPages}
                        </span>
                        <ChevronRightIcon className='cursor-pointer hover:text-primary-100' onClick={() => { pageNumber < numPages! ? setPageNumber(pageNumber + 1) : setPageNumber(firstPage!) }} />
                    </div>
                )}
            </div>
            <div
                className={`w-full h-full flex justify-center items-center lg:w-5/12 md:mt-12`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >


                <Document
                    file={{ url: url }}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Spiner />}
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        scale={1.0}
                        height={600}
                    />
                </Document>
            </div>

        </div>
    )

}