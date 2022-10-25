const express = require("express");
const app = express();
const config = require("./config.json")[0].gameServer;
const Database = require("./pages/database/db.js");
const db = new Database();

app.use(express.json());

let players = []; // tallentaa pelaajat jotta ei tarvitse tehdä monta eri hakua pelin aikana
let canvasWidth = -1;

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

app.post("/player", async (req, res)=>{
    const player = req.body;
    if(!player.token) return res.json({status:401});
    try{
        if(!player.x || !player.y || !player.w || !player.h || !player.username) return res.json({info:false});
        const user = await db.search("users", "username", player.username);
        if(user.username){
            const userToken = await db.search("tokens", "token", user.username);
            if(!userToken.err){
                if(db.compareTokens(player.token, userToken.token)){
                    const playerObject = {
                        username:player.username,
                        x:player.x,
                        y:player.y,
                        w:player.w,
                        h:player.h
                    }
                    const result = await db.insert(playerObject, "players");
                    if(result.affectedRows > 0) players.push(player);

                    if(result.err) return res.json({info:false});
                    return res.json({info:true});
                }
                return res.json({state:401});
            } 
        }else res.json({info:false});
        
    }catch(e){
        res.json({info:false});
    }

});

app.post("/move", async (req, res)=>{ // vain token check testattu
    const users = req.body;
    let player;
    let bot;
    for(let user of users){ // pitäisi olla vain 2 olioita aina
        if(user.token) player = user;
        else bot = user;
    }
    if(!player) return res.json({status:401});
    if(!player.username) return res.json({status:400,info:"Pelaajan nimi puuttuu"});
    try{
        const searchToken = await db.search("tokens", "token", player.username);
        if(!searchToken.token || !db.compareTokens(player.token, searchToken.token)) return res.json({status:401});

        let errString;
        switch(player){
            case !player.x:
                errString = `Pelaajan ${player.name} parametri 'x' puuttuu`;
                break;
            case !player.y:
                errString = `Pelaajan ${player.name} parametri 'y' puuttuu`;
                break;
            case !player.w:
                errString = `Pelaajan ${player.name} parametri 'w' puuttuu`;
                break;
            case !player.h:
                errString = `Pelaajan ${player.name} parametri 'h' puuttuu`;
                break;
        }
        if(errString) return res.json({status:400,info:errString});

        res.json({info:true});
    }catch(e){
        return res.json({err:"Liikkeen tarkistuksessa virhe"});
    }
});

app.post("/delete", async (req, res)=>{
    const player = req.body;
    if(!player.token) return res.json({status:401});
    if(!player.username) return res.json({err:"Puutteelliset tiedot"});

    const searchToken = await db.search("tokens", "token", player.username);
    if(searchToken.err) return res.json(searchToken);
    if(db.compareTokens(player.token, searchToken.token)){
        const result = await db.delete(player.username, "players");
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

app.listen(config.port, ()=>console.log("Peliservu liekeis"));