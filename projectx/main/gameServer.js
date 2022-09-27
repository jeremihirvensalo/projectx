const express = require("express");
const Database = require("./pages/database/db");
const app = express();
const config = require("./config.json")[0].gameServer;
const Database = require("./pages/database/db.js");
const db = new Database();

app.use(express.json());

app.post("/player", async (req, res)=>{
    const player = req.body;
    if(!player.token) res.json({status:401});
    if(!player.x || !player.y || !player.w || !player.h || !player.name) res.json({info:false});

    const user = await db.searchUser(player.name);
    if(!user.info && !user.err){
        const userToken = await db.searchToken(user.username);
        if(!userToken.err){
            if(db.compareTokens(player.token, userToken)){
                // Tässä pelaajan lisäys tietokantaan

                res.json({info:true});
            }
        } 
        res.json({info:false});
    }
    res.json({info:false});
});

app.listen(config.port, ()=>console.log("Peliservu liekeis"));