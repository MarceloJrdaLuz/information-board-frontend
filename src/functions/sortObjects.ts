export function sortArrayByProperty<T>(array: T[], key: string): T[] {
  return [...array].sort((a, b) => {
    const keys = key.split('.'); // Divide a chave em partes, se houver aninhamento

    // A função recursiva para acessar as propriedades aninhadas
    const getValue = (obj: any, keys: string[]): any => {
      if (keys.length === 1) {
        return obj[keys[0]];
      }
      return getValue(obj[keys[0]], keys.slice(1));
    };

    const valueA = String(getValue(a, keys)).toLowerCase();
    const valueB = String(getValue(b, keys)).toLowerCase();

    return valueA.localeCompare(valueB);
  });
}

