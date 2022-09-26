function suoritaToiminto(player, bot, toiminto, hp) {
    let botCRDS = bot.getCoords();
    let playerCRDS = player.getCoords();
    if(player.blockState() || playerCRDS.y != 245) return; // jos pelaaja on ilmassa tai torjumassa ei voida liikkua
    switch (toiminto) {
        case "LEFT":
            player.piirraCanvas();
            player.goLeft(20);
            bot.piirraChar();
            break;
        case "RIGHT":
            player.piirraCanvas();
            player.goRight(20, botCRDS.x);
            bot.piirraChar();
            break;
        case "UP":
            if (playerCRDS.y == 245) {
                player.piirraCanvas();
                player.jump(75, bot);
                bot.piirraChar();
            }
            break;
        case "PUNCH":
            player.punch(bot, hp);
            break;
        case "KICK":
            player.kick(bot, hp);
            break;
    }
}