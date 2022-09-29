const express = require("express");
const app = express();
const config = require("./config.json")[0].gameServer;
const Database = require("./pages/database/db.js");
const db = new Database();

app.use(express.json());

app.post("/player", async (req, res)=>{
    const player = req.body;
    if(!player.token) res.json({status:401});
    if(!player.x || !player.y || !player.w || !player.h || !player.username) res.json({info:false});
    try{
        const user = await db.searchUser(player.username);
        if(user.username){
            const userToken = await db.searchToken(user.username);
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

app.listen(config.port, ()=>console.log("Peliservu liekeis"));