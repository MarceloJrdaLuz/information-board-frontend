export function threeMonths() {

    //Essa funcao é chamada pra reconhecer se a programacao deve exibir tres meses.

    const today = new Date().getDate()
    const dayWeekActual = new Date().getDay()
    const monday = today - dayWeekActual + 1
    return monday <= 0 ? true : false
}