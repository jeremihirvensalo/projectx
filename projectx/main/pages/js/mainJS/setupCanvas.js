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

let keypressed = false;
let player;
let bot;

async function start() {
    if(window.innerWidth < 810){
        document.getElementById("points").style.display = "none";
        document.getElementById("canvas").style.display = "none";
        document.getElementById("controlsInfo").style.display = "none";
        document.getElementById("infoalue").innerHTML = "Näyttö on liian pieni!";
        document.getElementById("infoalue").style.display = "block";
        return;
    }
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "grey"; // tähän background kuva + sen funktiot yms
    ctx.fillRect(0, 0, 800, 400); // tää on osa tätä nykystä backgroundia
    const playerName = getCookieValue("username");
    player = new Character(ctx, 60, 245, 90, 150, "green", 100, playerName);
    bot = new Character(ctx, 650, 245, 90, 150, "red", 100, "bot"); 
    const hp = new HP(ctx, player, bot);

    // localhost:3001/player vois muuttaa sillee että ottaa 2 olioo vastaan jollon tarttis vaa yhen kutsun
    const addUsers = await new Promise(async (resolve,reject)=>{
        const addUser = await addPlayer(player, getCookieValue("username"));
        const addBot = await addPlayer(bot);
        if(!addUser.info || !addBot.info) reject(!addUser.info ? addUser.err : addBot.err);
        resolve(`Käyttäjien lisäys onnistui`);
    });

    console.log(addUsers);
    
    hp.drawBarL(playerName);
    hp.drawBarR("Bot");
    stopCanvasEvents(false);
    const restart = document.getElementById("restart");
    if(restart.style.display != "none") restart.style.display = "none";
    showPoints(player.getPoints());
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
            suoritaToiminto(player, bot, movement[e.code], hp);
        }
    });
    document.addEventListener("keyup", e => {
        keypressed = false;
        if (canvasEvents()) return;
        if (movement[e.code] == "BLOCK") player.block(false);
    });
}

function returnPlayers(){
    return {player:player,bot:bot}
}

function showPoints(points){
    document.getElementById("points").innerHTML = "Points: " + points;
}

function formatPlayer(player, username, isBot){ // write API
    const playerCRDS = player.getCoords();
    const playerObject = {
        username: username,
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

async function addPlayer(player, username){ // write API
    try{
        const params = [];
        if(!username) params.push("bot",true);
        else params.push(getCookieValue("username"), false);
        const playerObject = formatPlayer(player, params[0], params[1]);
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
        if(!result.info){
            document.getElementById("infoalue").style.display = "block";
            document.getElementById("infoalue").innerHTML = `Virhe pelaajan '${playerObject.username}' lisäyksessä`;
            return {info:false, err:`Virhe pelaajan '${playerObject.username}' lisäyksessä`};
        }
        return {info:true, username: playerObject.username};
    }catch(e){
        return {info:false, err:"Odottamaton virhe tapahtui pelaajien lisäyksessä"}
    }

}

(function () {
    document.addEventListener("DOMContentLoaded", start);
})();