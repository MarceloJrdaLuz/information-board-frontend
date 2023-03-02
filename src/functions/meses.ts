export const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril','Maio','Junho', 'Julho', 'Agosto', 'Setembro','Outubro', 'Novembro','Dezembro'];


export default function DateConverter (opcao: string){

    // essa funcao recebe como parametro 3 opcoes que podem ser mes (mes atual), mes-1 (mes anterior) ou mes +1 (mes Seguinte)
    const mesCapturado = new Date().getMonth()
    switch(opcao){
        case 'mes': return meses[mesCapturado];
        case 'mes-1': 
            return mesCapturado === 0 ? meses[mesCapturado+11] : meses[mesCapturado-1];
        case 'mes+1':
            return mesCapturado === 11 ? meses[mesCapturado-11] : meses[mesCapturado+1];   
    }   
}

export function tresMesesProgramacao(){

    //Essa funcao é chamada pra reconhecer se a programacao deve exibir tres meses.

    const diaHoje = new Date().getDate()
    const diaSemanaAtual = new Date().getDay()
    const segunda = diaHoje - diaSemanaAtual+1
    console.log(segunda)
    return segunda <= 0 ? true : false
}

export function casoJanOuDez (mes: number){
    console.log(mes)
    // recebe um mes que será 0 ou 11, se for mes 0 (janeiro) ele retorna o mes de dezembro (11) caso for 11 ele retorna o mes de janeiro (0)
    return mes === 0 ? 11 : 10
}

export function MesString(mes: number){
    // Capturar o dia atual pra ver se passou do dia 25, se for entâo se entende que ela está preenchendo o relatório do mes atual, do contrario se refere ao mes anterior.
    const diaAtual = new Date().getDate()

    return diaAtual >=25 ?  meses[mes] : meses[mes === 0 || mes === 11 ? casoJanOuDez(mes) : mes-1] //caso o mes atual for dezembro ou janeiro caem num caso diferente de mes ou mes -1, então é chamada a função pra esse caso.
}