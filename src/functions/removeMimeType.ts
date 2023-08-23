export function removeMimeType(text: string) {
    var partes = text.split('.');
    if (partes.length > 0) {
      return partes[0];
    } else {
      return text;
    }
  }