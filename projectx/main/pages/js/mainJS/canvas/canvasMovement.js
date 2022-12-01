async function suoritaToiminto(player, bot, toiminto, hp) {
    let playerCRDS = player.getCoords();
    if(player.blockState() || playerCRDS.y != 245) return; // jos pelaaja on ilmassa tai torjumassa ei voida liikkua
    let allowed = false;
    switch (toiminto) {
        case "LEFT":
            allowed = await player.goLeft(20);
            break;
        case "RIGHT":
            allowed = await player.goRight(20);
            break;
        case "UP":
            if (playerCRDS.y == 245) allowed = await player.jump(75);
            break;
        case "PUNCH":
            player.punch(bot, hp);
            return;
        case "PUNCHL":
            player.punchL(bot, hp);
            return;
        case "KICK":
            player.kick(bot, hp);
            return;
        case "KICKL":
            player.kickL(bot, hp);
            return;
    }
    if(allowed) await bot.piirraCharStill();
    else{
        console.log("Move not allowed");
        stopCanvasEvents(false);
    } 
}

async function verifyMove(player){ // write API
    try{
        const formattedPlayer = formatPlayer(player);
        const options = {
            method:"POST",
            body:JSON.stringify(formattedPlayer),
            headers:{
                "Content-Type":"application/json"
            }
        }
        const result = await fetch("http://localhost:3001/move",options).then(async (data)=>{
            return await data.json();
        });
        const check = statusCheck(result);
        if(!check.info || !result.info) return false;
        return true;
    }catch(e){
        return false;
    }

}