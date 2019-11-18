let colors = [["rgb(0, 128, 0)", "rgb(128, 0, 0)", "rgb(128, 128, 0)", "rgb(0, 0, 128)"], // cores de cada botão apagado
              ["rgb(0, 255, 0)", "rgb(255, 0, 0)", "rgb(255, 255, 0)", "rgb(0, 0, 255)"]]; // cores de cada botão aceso

let music=[]; // vetor dos sons
let nextGameState = 0; // estado atual do jogo (transiçao entre as telas) { 1 = inicio | 2 = game | 3 = ranking }
let clones = []; // vetor pra guardar o backup das divs
let levels = [8, 14, 20, 31]; // limite de jogadas pra cada dificuldade
let sequence = []; // vetor da sequencia
let currentStep = 0; // sequencia que o game está tocando
let playerStep = 0; // sequencia que o player está tocando
let turn = "game"; // de quem é o turno { "game" | "player" }
let lastPlayerStep = 0; // ultima vez que o player fez alguma ação
let currentButton = 0; // botão atual

let config = { // configurações padrão do jogo
    mode : "siga",
    level : 1,
    name : "",
    points : 0
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentTime()
{
    return new Date().getTime();
}

function loadAudio()
{
    music[0] = new Audio();
    music[0].src = "audio/simonSound1.mp3";
    
    music[1] = new Audio();
    music[1].src = "audio/simonSound2.mp3";

    music[2] = new Audio();
    music[2].src = "audio/simonSound3.mp3";

    music[3] = new Audio();
    music[3].src = "audio/simonSound4.mp3";

    music[4] = new Audio();
    music[4].src = "audio/error.wav";
}

function removeDiv(start, game, ranking)
{
    if(start)
    {
        $("#startScreen").remove();
    }

    if(game)
    {
        $("#gameScreen").remove();
    }

    if(ranking)
    {
        $("#rankingScreen").remove();
    }
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

function setConfig(mode, level, name)
{
    config.mode = mode;
    config.level = level;
    config.name = name;
    config.points = 0;
}

function addSequence(btnID)
{
    config.points = sequence.length;

    if(config.mode == "siga")
    {
        sequence.push((Math.floor(Math.random() * 10) % 4) + 1);
    }
    else if(config.mode == "crie")
    {
        if(btnID)
            sequence.push(btnID);
        else
            sequence.push((Math.floor(Math.random() * 10) % 4) + 1);
    }
    currentStep = 0;
}

function initSequence(mode)
{
    sequence = [];
    if(mode == "siga" || mode == "crie")
    {
        addSequence();
        turn = "game";
    }
}

function updateText()
{
    $("#pscore").text("Atual: " + sequence.length);
    $("#ptotal").text("Objetivo: " + levels[config.level]);

    if(lastPlayerStep)
    {
        let timeleft = Math.floor(((lastPlayerStep + 5000) - getCurrentTime()) / 1000) + 1;

        $("#ptempo").text("Tempo Restante: " + timeleft);
    }
    else
    {
        $("#ptempo").text("Tempo Restante: ...");
    }
}

function setLight(btnID, state)
{
    if((btnID < 1 || btnID > 4) || (state < 0 || state > 1)) return;

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
    nextGameState = 1;
    currentButton = 0;
    config.name = "";
    config.points = 0;
    config.mode = "siga";
}

let ranking=[];
function pontos(modo,score,nome)
{
    ranking = JSON.parse(localStorage.getItem("genius-game-ranking"));
    if(ranking === null)
        ranking = [];
        
    if(nome != "")
    {
        let inform={
            modo: modo,
            score: score,
            nome: nome
        };          
        ranking.push(inform)
    }

    ranking.sort(function(a,b) // organizando ranking por melhor pontuação
    {
        if(a.score<b.score)
        {
            return 1;
        }
        if(a.score>b.score)
        {
            return -1;
        }
        return 0;
    });

    localStorage.setItem("genius-game-ranking", JSON.stringify(ranking));

    $('#rsNome').text('NOME:  '+config.name);
    
    $('#rsPontos').text('PONTOS: '+config.points);
        
    $('#rsdivRanking').html('<p id="rsRanking" style="font-size:32px;">Ranking:</p>');    
    for (let i=0; i<(ranking.length<10?ranking.length:10);i++)
    {
        $('#rsdivRanking').html($('#rsdivRanking').html() + "<br>" + "Nome: " + ranking[i].nome + " | Modo: " + ranking[i].modo + ' | Pontos: ' + ranking[i].score);        
    }
}

async function playError()
{
    turn = "game";
    music[4].play();
         
    await sleep(1000);
    nextGameState = 3;
}

async function flashButton(btnID, origin)
{
    if(currentButton != 0 || origin != turn) return;

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
                await playError();
                return;
            }

            playerStep++;
            lastPlayerStep = getCurrentTime();
        }
        else
        {
            if(config.mode == "crie")
            {
                addSequence(btnID);
                playerStep = 0;
                lastPlayerStep = getCurrentTime();
            }
        }

        if(playerStep == sequence.length)
        {
            if(config.mode == "siga")
            {
                if(sequence.length >= levels[config.level])
                {
                    turn = "game";
                    alert("Parabéns você venceu!!");
                    //pontos(config.mode,config.points, config.name);
                    await sleep(2000);
                    nextGameState = 3;
                }
                else
                {
                    turn = "game";
                    await sleep(1000);
                    playerStep = 0;
                    lastPlayerStep = 0;
                    addSequence(config.mode);
                }
            }
        }
    }

    currentButton = 0;

    await sleep(200);
}

let currentGameState = 0;
function setGameState(state)
{
    switch(state)
    {
        case 1:
            updateClones();
            removeDiv(false, true, true);
            clones["start"].appendTo(".container-fluid");
            break;
        case 2:
            updateClones();
            removeDiv(true, false, true);
            clones["game"].appendTo(".container-fluid");
            updateButtonSize();
            initSequence(config.mode);
            break;
        case 3:
            updateClones();
            removeDiv(true, true, false);
            clones["ranking"].appendTo(".container-fluid");
            pontos(config.mode,config.points, config.name);            
            break;
    }

    currentGameState = state;
}

async function mainGame()
{
    if(nextGameState != currentGameState)
    {
        setGameState(nextGameState);
        await sleep(500);
    }
    else
    {
        if(currentGameState == 2)
        {
            updateButtonSize();
            updateText();

            switch(turn)
            {
                case "player":
                    if(lastPlayerStep == 0)
                    {
                        lastPlayerStep = getCurrentTime();
                    }
                    else
                    {
                        let timeleft = Math.floor(((lastPlayerStep + 5000) - getCurrentTime()) / 1000) + 1;
                        if(timeleft <= 0)
                        {
                            turn = "game";
                            await playError();
                        }
                    }
                    break;

                case "game":
                    if(currentStep != sequence.length)
                    {
                        await flashButton(sequence[currentStep], "game");
                    }
                    break;
            }
        }
    }

    requestAnimationFrame(mainGame);
}

$(document).ready(function(){    
    loadAudio();

    $("#iniciar").click(function(){
        let mode = $("#mode option:selected").val();
        let level = Number($("#level option:selected").val());
        let name = $("#playerName").val();

        if(name == "")
        {
            alert("Preencha o campo nome.");
            return;
        }

        setConfig(mode, level, name);

        nextGameState = 2;
    });

    for(let i = 1; i <= 4; i++)
    {
        setLight(i, 0);

        $("#btn" + i).click(function(){
            flashButton(i, "player");
        });
    }

    $("#reset").click(() => resetGame());

    $("#goranking").click(() => nextGameState = 3)

    updateClones();
    removeDiv(true, true, true);

    nextGameState = 1;

    requestAnimationFrame(mainGame);
})