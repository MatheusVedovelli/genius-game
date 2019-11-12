let colors = [["rgb(0, 128, 0)", "rgb(128, 0, 0)", "rgb(128, 128, 0)", "rgb(0, 0, 128)"], // cores de cada botão apagado
              ["rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(255, 255, 0)", "rgb(0, 0, 255)"]]; // cores de cada botão aceso

let music=[]; // vetor dos sons
let gameState = 0; // estado atual do jogo (transiçao entre as telas)
let clones = [];
let levels = [8, 14, 20, 31];
let sequence = [];
let currentStep = 0;
let playerStep = 0;
let turn = "game";
let lastPlayerStep = 0;
let currentButton = 0;

let config;

function sleep(ms) { // pausa a execução da função atual (precisa ser async) pelo tempo estipulado em milisegundos
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentTime()
{
    return new Date().getTime();
}

function updateClones()
{
    if($("#startScreen").length)
    {
        clones["start"] = $("#startScreen").clone(true, true);
    }

    if($("#gameScreen").length)
    {
        clones["game"] = $("#gameScreen").clone(true, true);
    }

    if($("#rankingScreen").length)
    {
        clones["ranking"] = $("#rankingScreen").clone(true, true);
    }
}

function initSequence(mode)
{
    sequence = [];
    if(mode == "solo")
    {
        addSequence(mode);
        turn = "game";
    }
}

function addSequence(mode)
{
    if(mode == "solo")
    {
        sequence.push((Math.floor(Math.random() * 10) % 4) + 1);
        currentStep = 0;

        $("#pscore").text("Atual: " + sequence.length);
        $("#ptotal").text("Objetivo: " + levels[config.level]);
    }
}

function setLight(btnID, state) // seta a luz do botão (0 = apagado | 1 = aceso)
{
    if((btnID < 1 || btnID > 4) || (state < 0 || state > 1)) return; // só pra garantir que os valores são válidos

    $("#btn" + btnID).css("color", colors[state][btnID-1]);
    $("#btn" + btnID).css("background-color", colors[state][btnID-1]);
}

function updateButtonSize()
{
    for(let i = 1; i <= 4; i++)
    {
        $("#btn" + i).width($(document).width()/4);
        $("#btn" + i).height(($(document).height()/5)*2);
    }
}

function resetGame()
{
    sequence = [];
    currentStep = 0;
    playerStep = 0;
    turn = "game";
    lastPlayerStep = 0;
    gameState = 1;
    currentButton = 0;
}

async function playError()
{
    music[4].play();
    await sleep(1000);
}

async function flashButton(btnID, origin) // função que vai gerenciar o botão pressionado pelo usuário (piscar, emitir som e verificar ordem)
{
    if(currentButton != 0 || origin != turn) return; // permitir apertar o proximo botão apenas quando o ultimo tiver terminado

    currentButton = btnID;
    setLight(btnID, 1);

    music[btnID-1].play();
    await sleep(400);

    setLight(btnID, 0);

    if(origin == "game")
    {
        currentStep++;
        if(currentStep >= sequence.length)
        {
            turn = "player";
        }
    }
    else if(origin == "player")
    {
        if(playerStep < sequence.length)
        {
            if(sequence[playerStep] != btnID)
            {
                turn = "game";
                await playError();
                gameState = 3;
                return;
            }

            playerStep++;
            lastPlayerStep = getCurrentTime();

            if(playerStep == sequence.length)
            {
                if(sequence.length < levels[config.level])
                {
                    turn = "game";
                    await sleep(1000);
                    playerStep = 0;
                    lastPlayerStep = 0;
                    addSequence(config.mode);
                }
                else
                {
                    turn = "game";
                    alert("Parabéns você venceu!!");
                    await sleep(2000);
                    gameState = 3;
                    return;
                }
            }
        }
    }

    currentButton = 0;

    await sleep(200);
}

let prevGameState = -1;
function setGameState(state)
{
    switch(state)
    {
        case 1: // start
            updateClones();
            $("#gameScreen").remove();
            $("#rankingScreen").remove();
            clones["start"].appendTo(".container-fluid");
            break;
        case 2: // play
            updateClones();
            $("#startScreen").remove();
            $("#rankingScreen").remove();
            clones["game"].appendTo(".container-fluid");
            updateButtonSize();
            initSequence(config.mode);
            break;
        case 3: // score e ranking
            updateClones();
            $("#startScreen").remove();
            $("#gameScreen").remove();
            clones["ranking"].appendTo(".container-fluid");
            break;
    }

    prevGameState = state;
    return state;
}

async function mainGame()
{
    if(gameState != prevGameState)
    {
        setGameState(gameState);
        await sleep(500);
    }
    else
    {
        if(gameState == 2)
        {
            updateButtonSize();
    
            if(currentStep != sequence.length)
            {
                await flashButton(sequence[currentStep], "game");
            }

            if(turn == "player")
            {
                if(lastPlayerStep == 0)
                {
                    lastPlayerStep = getCurrentTime();
                }
                else
                {
                    let timeleft = Math.floor(((lastPlayerStep + 5000) - getCurrentTime()) / 1000) + 1;
                    $("#ptempo").text("Tempo Restante: " + timeleft);
                    
                    if(timeleft == 0)
                    {
                        turn = "game";
                        await playError();
                        gameState = 3;
                    }
                }
            }
        }
    }

    requestAnimationFrame(mainGame);
}

$(document).ready(function(){
    music[0] = new Audio();
    music[0].src = "audio/simonSound1.mp3"
    
    music[1] = new Audio();
    music[1].src = "audio/simonSound2.mp3"

    music[2] = new Audio();
    music[2].src = "audio/simonSound3.mp3"

    music[3] = new Audio();
    music[3].src = "audio/simonSound4.mp3"

    music[4] = new Audio();
    music[4].src = "audio/error.wav"

    
    $("#iniciar").click(function(){
        config = {
            mode : $("#mode option:selected").val(),
            level : Number($("#level option:selected").val()),
            name : $("#playerName").val()
        };

        if(config.name == "")
        {
            alert("Preencha o campo nome.");
            return;
        }

        gameState = 2;
    });

    for(let i = 1; i <= 4; i++)
    {
        setLight(i, 0);

        $("#btn" + i).click(function(){
            flashButton(i, "player");
        });
    }

    $("#reset").click(function(){
        resetGame();
    });

    updateClones();
    $("#startScreen").remove();
    $("#gameScreen").remove();
    $("#rankingScreen").remove();

    gameState = 1;

    requestAnimationFrame(mainGame);
})