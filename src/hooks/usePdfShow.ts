import { useState } from "react"

export default function usePdfShow (){
    const [pdfShow, setPdfShow] = useState(false)
    return{
        pdfShow,
        setPdfShow
    }
}