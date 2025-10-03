import { ITerritoryHistory } from "@/types/territory"

export function sortArrayByProperty<T>(array: T[], key: string): T[] {
  return [...array].sort((a, b) => {
    const keys = key.split('.') // Divide a chave em partes, se houver aninhamento

    // A função recursiva para acessar as propriedades aninhadas
    const getValue = (obj: any, keys: string[]): any => {
      if (keys.length === 1) {
        return obj[keys[0]]
      }
      return getValue(obj[keys[0]], keys.slice(1))
    }

    const valueA = String(getValue(a, keys)).toLowerCase()
    const valueB = String(getValue(b, keys)).toLowerCase()

    return valueA.localeCompare(valueB)
  })
}

export const sortByCompletionDate = (historyList: ITerritoryHistory[]): ITerritoryHistory[] => {
  return historyList.slice().sort((a, b) => {
      // Primeiramente, ordena por completion_date nulo
      if (a.completion_date === null && b.completion_date !== null) return -1
      if (a.completion_date !== null && b.completion_date === null) return 1

      // Se ambos têm completion_date, ordena por data de conclusão ascendente
      if (a.completion_date && b.completion_date) {
          return new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
      }

      return 0 // Mantém a ordem para outros casos
  })
}


