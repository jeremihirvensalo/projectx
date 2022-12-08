async function suoritaToiminto(player, bot, toiminto, hp) {
    let playerCRDS = player.getCoords();
    if(player.blockState() || playerCRDS.y != 255) return; // jos pelaaja on ilmassa tai torjumassa ei voida liikkua
    let allowed = false;
    switch (toiminto) {
        case "LEFT":
            allowed = await player.goLeft(20, true);
            return;
        case "RIGHT":
            allowed = await player.goRight(20, true);
            return;
        case "UP":
            if (playerCRDS.y == 245) allowed = await player.jump(75, true);
            return;
        case "PUNCH":
            await player.punch(bot, hp);
            return;
        case "KICK":
            await player.kick(bot, hp);
            return;
        case "BLOCK":
            await player.block();
    }
    if(!allowed){
        console.log("Move not allowed");
    } 
}

async function verifyMove(player){
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