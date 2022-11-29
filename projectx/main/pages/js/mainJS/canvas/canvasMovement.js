async function suoritaToiminto(player, bot, toiminto, hp) {
    let botCRDS = bot.getCoords();
    let playerCRDS = player.getCoords();
    if(player.blockState() || playerCRDS.y != 245) return; // jos pelaaja on ilmassa tai torjumassa ei voida liikkua
    let allowed = false;
    switch (toiminto) {
        case "LEFT":
            allowed = await player.goLeft(20);
            if(allowed) bot.piirraCharStill();
            break;
        case "RIGHT":
            allowed = await player.goRight(20, botCRDS.x);
            if(allowed) bot.piirraCharStill();
            break;
        case "UP":
            if (playerCRDS.y == 245) {
                allowed = await player.jump(75, bot);
                if(allowed) bot.piirraCharStill();
            }
            break;
        case "PUNCH":
            player.punch(bot, hp);
            break;
        case "PUNCHL":
            player.punchL(bot, hp);
            break;
        case "KICK":
            player.kick(bot, hp);
            break;
        case "KICKL":
            player.kickL(bot, hp);
            break;
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