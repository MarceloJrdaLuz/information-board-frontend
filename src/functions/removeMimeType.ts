export function removeMimeType(text: string) {
  const parts = text.split('.')
  const fileName = parts.length > 0 ? parts[0] : text

  // Divide a string em palavras usando espaço e pontos como delimitadores
  const words = fileName.split(/[\s.]+/)

  // Transforma palavras com mais de 3 letras em CamelCase
  const camelCasedWords = words.map((word, index) => {
    if (word.length > 3) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    } else {
      return word.toLowerCase()
    }
  })

  return camelCasedWords.join(' ')
}
