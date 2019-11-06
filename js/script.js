let colors = [["rgb(0, 128, 0)", "rgb(128, 0, 0)", "rgb(128, 128, 0)", "rgb(0, 0, 128)"], // cores de cada botão apagado
              ["rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(255, 255, 0)", "rgb(0, 0, 255)"]]; // cores de cada botão aceso

function sleep(ms) { // pausa a execução da função atual (precisa ser async) pelo tempo estipulado em milisegundos
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setLight(num, state) // seta a luz do botão (0 = apagado | 1 = aceso)
{
    if((num < 1 || num > 4) || (state < 0 || state > 1)) return; // só pra garantir que os valores são válidos

    $("#btn" + num).css("color", colors[state][num-1]);
    $("#btn" + num).css("background-color", colors[state][num-1]);
}

let currentButton = 0;
async function flashButton(num) // função que vai gerenciar o botão pressionado pelo usuário (piscar, emitir som e verificar ordem)
{
    if(currentButton != 0) return; // permitir apertar o proximo botão apenas quando o ultimo tiver terminado

    currentButton = num;
    setLight(num, 1);

    // inserir som do botão aqui

    await sleep(1000);
    setLight(num, 0);
    currentButton = 0;
}

$(document).ready(function(){
    for(let i = 1; i <= 4; i++)
    {
        setLight(i, 0);
        $("#btn" + i).width($(document).width()/4);
        $("#btn" + i).height(($(document).height()/5)*2);

        $("#btn" + i).click(function(){
            flashButton(i);
        });
    }
})