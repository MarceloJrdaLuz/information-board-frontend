export function sortArrayByProperty<T>(array: T[], key: keyof T): T[] {
  return [...array].sort((a, b) => {
    const valueA = String(a[key]).toLowerCase()
    const valueB = String(b[key]).toLowerCase()

    return valueA.localeCompare(valueB)
  })
}
