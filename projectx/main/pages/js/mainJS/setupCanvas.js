const movement = {
    ArrowUp: "UP",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    KeyW: "UP",
    KeyA: "LEFT",
    KeyD: "RIGHT",
    Space: "BLOCK",
    KeyF: "PUNCH",
    KeyG: "KICK"
};

let keypressed = false;
let player;
let bot;

function start() {
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
    ctx.fillStyle = "grey"; // tähän background kuva
    ctx.fillRect(0, 0, 800, 400);
    player = new Character(ctx, 60, 245, 90, 150, "green", 100);
    bot = new Character(ctx, 650, 245, 90, 150, "red", 100);
    const hp = new HP(ctx, player, bot);
    const playerName = getCookieValue("username");
    hp.drawBarL(playerName);
    hp.drawBarR("Bot");
    stopCanvasEvents(false);
    const restart = document.getElementById("restart");
    if(restart.style.display != "none") restart.style.display = "none";
    showPoints(player.getPoints());
    document.addEventListener("keydown", e => {
        if(keypressed) return;
        keypressed = true;
        if (canvasEvents()) return; // this is stupid. rework needed
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

function returnPlayers(){ // write API
    return {player:player,bot:bot}
}

function showPoints(points){
    document.getElementById("points").innerHTML = "Points: " + points;
}
(function () {
    document.addEventListener("DOMContentLoaded", start);
})();