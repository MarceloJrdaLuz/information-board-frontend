function normalize(str?: string): string {
  return (str ?? "")
    .trim()                // tira espaços no começo e fim
    .replace(/\s+/g, " "); // troca múltiplos espaços por um só
}

export function formatNameCongregation(name?: string, city?: string): string {
  const cleanName = normalize(name);
  const cleanCity = normalize(city);

  if (!cleanName && !cleanCity) return "";

  // Se são iguais, retorna só uma vez
  if (cleanName && cleanName.toLowerCase() === cleanCity.toLowerCase()) {
    return `(${cleanName})`;
  }

  // Se são diferentes, junta
  if (cleanName && cleanCity) {
    return `(${cleanName} - ${cleanCity})`;
  }

  // Se só tem um definido
  return `(${cleanName || cleanCity})`;
}
