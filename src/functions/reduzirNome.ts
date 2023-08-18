export function reduzirNome(fullName: string) {
    let palavras = fullName.split(" ")
    if (palavras.length < 2) {
        return fullName
    }
    for (let i = 1; i < palavras.length - 1; i++) {
        let nomeMeio = palavras[i]

        if(nomeMeio.length > 3){
            let inicial = nomeMeio.charAt(0) + "."
            palavras[i] = inicial;
        }
      }
    
      let nomeAbreviado = palavras.join(" ")

      return nomeAbreviado
}