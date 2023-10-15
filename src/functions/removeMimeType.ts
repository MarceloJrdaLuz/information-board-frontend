export function removeMimeType(text: string) {
  const parts = text.split('.')
  const fileName = parts.length > 0 ? parts[0] : text

  const words = fileName.split(/[^a-zA-Z]+/)

  // Transform words with more than 3 letters to CamelCase
  const camelCasedWords = words.map((word, index) => {
    if (word.length > 3) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    } else {
      return word.toLowerCase()
    }
  })

  return camelCasedWords.join(' ')
}
