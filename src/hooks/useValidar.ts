import { useState } from "react";

export default function useValidar(){
    const [inputHorasInvalido, setInputHorasInvalido] = useState(false)
    const [inputNomeInvalido, setInputNomeInvalido] = useState(false)

    return{
        inputHorasInvalido,
        inputNomeInvalido, 
        setInputHorasInvalido,
        setInputNomeInvalido
    }
}


