const abobo = {
    nimi: "abobo.png",
    kuva: null,
    ALAS: [
        { x: 411, y: 1022, leveys: 104, korkeus: 121 },
        { x: 66, y: 1195, leveys: 99, korkeus: 119 },
        { x: 196, y: 1191, leveys: 166, korkeus: 117 },
        { x: 66, y: 1195, leveys: 99, korkeus: 119 },
        { x: 411, y: 1022, leveys: 104, korkeus: 121 }
    ],
    YLOS: [

        { x: 323, y: 365, leveys: 101, korkeus: 114 },
        // { x: 444, y: 359, leveys: 97, korkeus: 132 },
        // { x: 85, y: 525, leveys: 97, korkeus: 120 },
        { x: 207, y: 520, leveys: 97, korkeus: 94 }
        // { x: 85, y: 525, leveys: 97, korkeus: 120 },
        // { x: 444, y: 359, leveys: 97, korkeus: 132 },
        // { x: 323, y: 365, leveys: 101, korkeus: 114 }
    ],
    VASEN: [
        { x: 74, y: 203, leveys: 98, korkeus: 125 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 442, y: 201, leveys: 96, korkeus: 127 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 }
    ],
    OIKEA: [
        { x: 74, y: 203, leveys: 98, korkeus: 125 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 442, y: 201, leveys: 96, korkeus: 127 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 }
    ]
};

const abobo_mirrored = {
    nimi: "abobo_mirrored.png",
    kuva: null,
    ALAS: [
        { x: 411, y: 1022, leveys: 104, korkeus: 121 },
        { x: 66, y: 1195, leveys: 99, korkeus: 119 },
        { x: 196, y: 1191, leveys: 166, korkeus: 117 },
        { x: 66, y: 1195, leveys: 99, korkeus: 119 },
        { x: 411, y: 1022, leveys: 104, korkeus: 121 }
    ],
    YLOS: [

        { x: 323, y: 365, leveys: 101, korkeus: 114 },
        // { x: 444, y: 359, leveys: 97, korkeus: 132 },
        // { x: 85, y: 525, leveys: 97, korkeus: 120 },
        { x: 207, y: 520, leveys: 97, korkeus: 94 }
        // { x: 85, y: 525, leveys: 97, korkeus: 120 },
        // { x: 444, y: 359, leveys: 97, korkeus: 132 },
        // { x: 323, y: 365, leveys: 101, korkeus: 114 }
    ],
    VASEN: [
        { x: 74, y: 203, leveys: 98, korkeus: 125 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 442, y: 201, leveys: 96, korkeus: 127 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 }
    ],
    OIKEA: [
        { x: 74, y: 203, leveys: 98, korkeus: 125 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 442, y: 201, leveys: 96, korkeus: 127 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 }
    ]
};

const movement = {
    ArrowUp: "UP",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    KeyW: "UP",
    KeyA: "LEFT",
    KeyD: "RIGHT",
    Space: "BLOCK",
    KeyF: "PUNCH",
    KeyR: "PUNCHL",
    KeyG: "KICK",
    KeyC: "KICKL"
};

let eventStatus = true;
let keypressed = false;
let player;
let bot;
let botUsername = "bot";
let playerAnim;
let botAnim;

async function start() {
    if(window.innerWidth < 810){
        document.getElementById("points").style.display = "none";
        document.getElementById("canvas").style.display = "none";
        document.getElementById("controlsInfo").style.display = "none";
        document.getElementById("infoalue").innerHTML = "Näyttö on liian pieni!";
        document.getElementById("infoalue").style.display = "block";
        return;
    }
    const canvasBG = document.getElementById("canvasBG");
    const ctxBG = canvasBG.getContext("2d");
    drawBG(ctxBG) // tämä on background image piirtofunktio. Jos et tiedä/ymmärrä toimintaa => API (löytyy rivin 920 lähistöltä)
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const playerName = getCookieValue("username");
    if(playerName === botUsername) botUsername += "_2";

    player = new Character(canvas, ctx, 60, 245, 90, 150, "green", 100, playerName);
    bot = new Bot(canvas, ctx, 650, 245, 90, 150, "red", 100, botUsername);
    await player.alusta(abobo);
    await bot.alusta(abobo_mirrored);
    playerAnim = player.getAnimations();
    botAnim = bot.getAnimations();
    const hp = new HP(ctx, player, bot); // perjaatteessa vois käyttää background canvasta

    try{
        await new Promise(async (resolve,reject)=>{
            if(parseInt($("#points").attr("value")) > 0) {
                const prepRound = await nextRound([formatPlayer(player,false),formatPlayer(bot,true)]);
                if(!prepRound.info){
                    $("#infoalue").html(prepRound.err);
                    reject(prepRound.err);
                }
                resolve("Uuden kierroksen aloitus onnistui");
            }else{
                const addUser = await addPlayer(player, false);
                const addBot = await addPlayer(bot, true);
                if(!addUser.info && !addBot.info) 
                reject({bothFailed: true,err:`Virhe pelaajan '${addUser.username }, ${addBot.username}' lisäyksessä`});
                else if(!addUser.info || !addBot.info) reject(!addUser.info ? addUser.err : addBot.err);
                resolve(`Käyttäjien lisäys onnistui`);
            }
        });
    }catch(e){
        console.log(e);
        $("#infoalue").html("Odottamaton virhe tapahtui");
    }

    hp.drawBarL(playerName);
    hp.drawBarR(botUsername);
    stopCanvasEvents(false);
    const restart = document.getElementById("restart");
    if(restart.style.display != "none") restart.style.display = "none";
    showPoints(player.getPoints());

    // setInterval(
    //     ()=>{
    //         bot.doRandomAction(player, hp);
    //     },
    //     1700
    // )

    document.addEventListener("keydown", e => {
        if(keypressed) return;
        keypressed = true;
        if (canvasEvents()) return;
        if (movement[e.code] == "BLOCK") {
            if (player.blockState()) return;
            else {
                player.block(true);
            }
        } else {
            stopCanvasEvents(true);
            suoritaToiminto(player, bot, movement[e.code], hp);
        }
    });
    document.addEventListener("keyup", e => {
        keypressed = false;
        if (canvasEvents()) return;
        if (movement[e.code] == "BLOCK") player.block(false);
    });

    $(window).bind("beforeunload", async function(){
        const result = await resetServer();
        console.log(result);
    });
}

function canvasEvents(){
    return eventStatus;
}

function stopCanvasEvents(state=false){
    eventStatus = state;
}

function returnPlayers(){
    return {player:player,bot:bot}
}

function showPoints(points){
    $("#points").attr("value",points);
    document.getElementById("points").innerHTML = "Points: " + points;
}

function formatPlayer(player, isBot){
    const playerCRDS = player.getCoords();
    const playerObject = {
        username: player.getName(),
        x: playerCRDS.x,
        y: playerCRDS.y,
        w: playerCRDS.w,
        h: playerCRDS.h,
        hp: player.getHP(),
        blockstate: player.blockState()
    }

    if(!isBot) return {...playerObject, ...{token:getCookieValue("token")}};
    return playerObject;
}

async function addPlayer(player, isBot){
    try{
        const playerObject = formatPlayer(player, isBot);
        const options = {
            method:"POST",
            body: JSON.stringify(playerObject),
            headers: {
                "Content-Type":"application/json"
            }
        }
        let result = await fetch("http://localhost:3001/player", options).then(async data =>{
            return await data.json();
        });
        const check = statusCheck(result);
        if(!result.info && check.status !== 409) 
        return {info:false, err:`Virhe pelaajan '${playerObject.username}' lisäyksessä`,username:playerObject.username};
        
        if(check.status === 409) botUsername = result.username;
        return {info:true, username: result.username};
    }catch(e){
        return {info:false, err:"Odottamaton virhe tapahtui pelaajien lisäyksessä"}
    }

}

async function nextRound(usersObj){
    try{
        const options = {
            method:"POST",
            body:JSON.stringify(usersObj),
            headers:{
                "Content-Type":"application/json"
            }
        }

        const result = await fetch("http://localhost:3001/continue",options).then(async (data)=>{
            return await data.json();
        });
        const check = statusCheck(result);
        if(!check.info) $("#infoalue").html(check.details);
        else if(check.info) return {info:true};
        return {info:false, err:result.err};
    }catch(e){
        return {err:"Odottamaton virhe tapahtui uuden kierokksen aloituksessa"};
    }
}

function statusCheck(result){
    if(result.status){
        const knownCodes = [400,401,409];
        let foundCode;
        for(let code of knownCodes){
            if(result.status === code){
                foundCode = code;
                break;
            }
        }
        if(foundCode){
            switch(foundCode){
                case 401:
                    window.location.href = "http://localhost:3000/";
                    return {info:false, details:"Token check fail", status:401};
                case 400:
                    return {info:false, details:result.err,status:400};
                case 409:
                    return {info:true, details:"Pelaaja oli jo luultavasti tietokannassa",status:409};
                case 500:
                    return {info:false,details:result.err,status:500};
                default:
                    return {info:true, details:`Ohjelmistolle tuntematon statuskoodi ('${result.status}')`,status:foundCode};
            }
        }
    }
    return {info:true, details:"Status-parametria ei löytynyt"};
}

async function resetServer(){
    try{
        const options = {
            method:"POST",
            body:JSON.stringify({token:getCookieValue("token")}),
            headers:{
                "Content-Type":"application/json"
            }
        }
        const result = await fetch("http://localhost:3001/reset",options).then(async (data)=>{
            return await data.json();
        });

        const check = statusCheck(result);
        if(!check.info) $("#infoalue").html(check.details);
        else if(check.info) return {info:true};
        return {info:false, err:result.err ? result.err : "Palvelimella tapahtui jotain outoa"};
    }catch(e){
        return {err:"Jokin meni pieleen"};
    }
}

function drawBG(ctxBG, imgs){
    if(!imgs) {
        ctxBG.fillStyle = "grey";
        ctxBG.fillRect(0, 0, 800, 400);
    }else{
        // tähän background image?
    }
}

(function () {
    document.addEventListener("DOMContentLoaded", start);
})();