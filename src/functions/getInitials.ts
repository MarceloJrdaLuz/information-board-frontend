export function getInitials(fullName: string) {
    const nameParts = fullName.split(" ")
    const firstLetterOfFirstName = nameParts[0].charAt(0)
    const lastName = nameParts[nameParts.length - 1]
    const firstLetterOfLastName = lastName.charAt(0)
  
    return firstLetterOfFirstName.toLocaleUpperCase() + firstLetterOfLastName.toUpperCase()
  }