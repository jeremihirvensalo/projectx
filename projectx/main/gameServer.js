const express = require("express");
const app = express();
const cors = require("cors");
const config = require("./config.json")[0].gameServer;
const Database = require("./pages/database/db.js");
const db = new Database();

app.use(express.json());
app.use(cors());

let players = []; // tallentaa pelaajat jotta ei tarvitse tehdä monta eri hakua pelin aikana

let playerIndex = 0; // molemmat indexit valmiissa versiossa = 0
let botIndex = 0; 
let canvasWidth = -1;
const defaultY = 245; // pelaajien positio Y canvaksella
const playerDefaultX = 60; // player alku x koordinaatti
const botDefaultX = 650; // bot alku x koordinaatti
const defaultHP = 100 // osumapisteiden oletusarvo

app.post("/game", async (req, res)=>{
    const state = req.body;
    if(!state.token) return res.json({status:401});
    if(!state.canvasWidth || state.canvasWidth < 800){
        return res.json({err:"Canvaksen leveys liian pieni tai sitä ei annettu"});
    }else if(state.canvasWidth && canvasWidth === -1) canvasWidth = state.canvasWidth;
    try{
        const searchToken = await db.search("tokens", "token", state.username);
        if(!db.compareTokens(state.token, searchToken.token)) return res.json({state:401});
        if(state.info === undefined || !state.token || !state.username) return res.json({err:"Tiedot puuttelliset"});
        if(!state.info){
            players = [];
            return res.json({info:true});
        }

        const result = await db.search("players", "*");
        if(!result.err && result.lenght === 2) players = result;
        else new Error();

        res.json({info:true});
    }catch(e){
        res.json({err:"Ohjelmassa tapahtui virhe"});
    }
});

app.post("/player", async (req, res)=>{ // tokenien tarkistus botilta ei testattu (eikä uusinta versiota tästä)
    const player = req.body;
    if(players.length === 2) return res.json({info:false,username:player.username,status:409});
    if(!player.token && players[playerIndex] === undefined) return res.json({status:401});
    try{
        if(!player.x || !player.y || !player.w || !player.h || !player.username || !player.hp || player.blockstate === undefined)
        return res.json({info:false});

        if(typeof player.blockstate !== "boolean") return res.json({info:false});
        if(players.length > 0){
            for(let i = 0; i < players.length; i++){
                if(player.username === players[i].username){ // tee clientin puolelle, että tajuaa 
                    player.username = player.username + "_2"; // vaihtaa nimen jos se on jo olemassa + update API sille
                    break;
                } 
            }
        }
        let user = {};
        if(player.token) user = await db.search("users", "username", player.username);
        
        if(user.username || !player.token){
            let userToken = {};
            if(players[playerIndex] === undefined) // jos botti lisätään ekana tulee kusee tähän luultavasti
            userToken = await db.search("tokens", "token", user.username);
            if(!userToken.err){
                if(Object.keys(userToken).length === 0 || db.compareTokens(player.token, userToken.token)){
                    const playerObject = {
                        username:player.username,
                        x:player.x,
                        y:player.y,
                        w:player.w,
                        h:player.h,
                        hp:player.hp,
                        blockstate:player.blockstate
                    }
                    const result = await db.insert(playerObject, "players");
                    if(!result.err){
                        if(player.token) playerIndex = players.length;
                        else botIndex = players.length;
                        players.push(player); 
                    } 
                    else if(result.err){
                        return res.json({info:false});
                    } 
                    
                    return res.json({info:true,username:player.username});
                }
                return res.json({state:401});
            } 
        }else res.json({info:false});
        
    }catch(e){
        res.json({info:false});
    }

});

app.post("/move", async (req, res)=>{
    const player = req.body;
    if(!player) return res.json({status:401});
    if(!player.username) return res.json({status:400,info:"Pelaajan nimi puuttuu"});
    try{
        if(!db.compareTokens(player.token, players[playerIndex].token)) return res.json({status:401});
        if(!player.x || !player.y || !player.w || !player.h || typeof player.blockstate !== "boolean") 
        return res.json({status:400, info:"Pelaajan jokin tieto puuttuu"});
        if(player.blockstate) return res.json({info:false});
        
        let result = false;
        for(let user of players){
            if(user.username === player.username){
                // seuraavat arvot ovat oletuksia, mutta voidaan vaihtaa muuttujiksi 
                if(player.x !== user.x){
                    if(player.x + 20 === user.x && player.x + 20 < canvasWidth - players[botIndex].x) result = true;
                    else if(player.x - 20 === user.x && player.x - 20 > 0) result = true;
                }else if(player.y !== user.y){
                    if(player.y + 75 === user.y && player.y - 75 === defaultY) result = true;
                    else if(player.y - 75 === user.y && player.y === defaultY + 75) result = true;
                }else if(player.w !== user.w || player.h !== user.h){
                    result = false;
                    break;
                }
            }
        }
        if(!result) return res.json({info:false});
        players[playerIndex] = player;
        res.json({info:true});
    }catch(e){
        return res.json({err:"Liikkeen tarkistuksessa virhe"});
    }
});

app.post("/attack", (req, res)=>{
    const player = req.body;
    // token and player check
    if(!player || !player.username || (!player.token && !players[playerIndex].token)) return res.json({status:401});
    else if(player.username === players[playerIndex].username){
        if(!db.compareTokens(player.token, players[playerIndex].token)) return res.json({status:401});
    }else if(player.username !== players[botIndex].username) return res.json({status:400,info:"Käyttäjää ei löydy"});

    // parameters check
    if(!player.x || !player.y || !player.w || !player.h || player.blockstate === undefined) 
    return res.json({status:400,info:"Jokin pelaajan tieto puuttuu"});

    if(typeof player.blockstate !== "boolean") return res.json({status:400,info:"Pelaajan data on virheellistä"});

    let whosIndex;
    if(player.token) whosIndex = playerIndex;
    else whosIndex = botIndex;

    if(player !== players[whosIndex]){
        const playerKeys = Object.keys(players[whosIndex]);
        const userKeys = Object.keys(player);
        for(let key of playerKeys){
            let found = false;
            for(let userKey of userKeys){
                if(userKey === key){
                    found = true;
                    break;
                } 
            }
            if(!found) return res.json({status:400,info:"Pelaajan data on virheellistä"});
        }
    }
    // take damage check
    if(player.x > players[whosIndex].x && (player.x - players[whosIndex].x) < 71 && player.username === players[whosIndex].username)
    return res.json({info:true,damage:true});
    else if(player.x < players[whosIndex].x && (players[whosIndex] - player.x) < 71 && player.username === players[whosIndex].username)
    return res.json({info:true,damage:true});

    return res.json({info:true,damage:false});
});

app.post("/delete", async (req, res)=>{
    const player = req.body;
    if(!player.token) return res.json({status:401});
    if(!player.username) return res.json({err:"Puutteelliset tiedot"});

    const searchToken = await db.search("tokens", "token", player.username);
    if(searchToken.err) return res.json(searchToken);
    if(db.compareTokens(player.token, searchToken.token)){
        const result = await db.delete(false, "players", player.username);
        for(let i = 0; i < players.length; i++){
            if(players[i].username === player.username){
                players.splice(i, 1);
                break;
            }
        }
        return res.json(result);
    }  
    return res.json({status:401});
});

app.post("/continue", async (req,res)=>{
    const users = req.body;
    let player;
    let bot;
    if(users.lenght) return res.json({status:400});
    for(let user of users){
        if(user.username === players[playerIndex].username) player = user;
        else bot = user;
    }
    if(!player.token) return res.json({status:401});
    if(!player.username || !bot.username)
    return res.json({info:false,status:400,err:"Username-parametri puuttuu toiselta pelaajalta tai on virheellinen"});

    const keys = Object.keys(players[botIndex]); // otetaan botin avaimet, jotta ei pidä huolehtia token-parametrista
    for(let user of users){
        let whoIndex;
        if(user.username === players[playerIndex].username) whoIndex = playerIndex;
        else if(user.username === players[botIndex].username) whoIndex = botIndex;
        else return res.json({info:false,status:400,err:"Username-parametri puuttuu toiselta pelaajalta tai on virheellinen"});

        for(let key of keys){
            if(key === "blockstate"){
                if(user[key] === undefined || typeof user[key] !== "boolean")
                return res.json({info:false,status:400,err:"Jokin parametri puuttui tai oli virheellinen"});
            }else{
                if(user[key] !== players[whoIndex][key])
                return res.json({info:false,status:400,err:"Jokin parametri puuttui tai oli virheellinen"});
            }
        }
    }
    if(!player.token) return res.json({status:401});
    else if(!db.compareTokens(player.token,players[playerIndex].token)) return res.json({status:401});

    // asetetaan pelaajat takaisin aloitus positioihin
    const startParams = [
        {
            username: player.username,
            x: playerDefaultX,
            y: defaultY,
            hp: defaultHP
        },
        {
            username: bot.username,
            x: botDefaultX,
            y: defaultY,
            hp: bot.newHP ? bot.newHP : defaultHP
        }
    ];

    for(let param of startParams){
        let whoIndex = param.username === players[playerIndex].username ? playerIndex : botIndex;
        for(let key of keys){
            if(param[key] !== undefined){
                players[whoIndex][key] = param[key];
            }
        }        
    }

    try{
        const resultArr = [];
        let counter = 0;
        for(let user of players){
            const deleteResult = await db.delete(false, "players", user.username);
            if(players[counter].token) delete players[counter].token;
            const insertResult = await db.insert(players[counter], "players");
            resultArr.push(deleteResult.info ? deleteResult.info : deleteResult.err);
            resultArr.push(insertResult.info ? insertResult.info : insertResult.err);
            counter++;
        }

        return res.json({info:true,details:resultArr});
    }catch(e){
        return res.json({info:false,details:e.message});
    }

});

app.listen(config.port, async ()=>{
    console.log("Peliservu liekeis");
    await db.delete(false, "players");
});