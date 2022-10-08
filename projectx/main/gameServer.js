const express = require("express");
const app = express();
const config = require("./config.json")[0].gameServer;
const Database = require("./pages/database/db.js");
const db = new Database();

app.use(express.json());

let players = []; // tallentaa pelaajat jotta ei tarvitse tehdä monta eri hakua pelin aikana

app.post("/game", async (req, res)=>{
    const state = req.body;
    if(state.info === undefined || !state.token || !state.username) return res.json({err:"Tiedot puuttelliset"});
    try{
        // token check here
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
        // token check here
        if(!player.x || !player.y || !player.w || !player.h || !player.username) return res.json({info:false});
        const user = await db.search("users", "username", player.username);
        if(user.username){
            const userToken = await db.search("tokens", "token", user.username);
            if(!userToken.err){
                if(db.compareTokens(player.token, userToken.token)){
                    const result = await db.insert(player, "players");
                    if(result.err) return res.json({info:false});
                    return res.json({info:true});
                }
            } 
        }else res.json({info:false});
        
    }catch(e){
        res.json({info:false});
    }

});

app.post("/move", async (req, res)=>{

});

app.post("/testing", async (req, res)=>{
    const player = req.body;
    const result = await db.newDelete(player.username);
    res.json(result);
});

app.listen(config.port, ()=>console.log("Peliservu liekeis"));