const path = require("path");
const express = require("express");
const app = express();
const config = require("./config.json");
const port = config[0].server.port;

const {token} = require("./pages/js/exports/token.js")
const Database = require("./pages/database/db.js");
const db = new Database();

const loginPath = path.join(__dirname, "pages", "login.html");
const mainPath = path.join(__dirname, "pages", "main.html");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "pages")));
app.use(express.json());

let id; //checkTokenDates() intervallin id

app.get("/", (req, res) => {
    res.sendFile(loginPath);
});

app.get("/main", (req, res)=>{
    res.sendFile(mainPath);
});

app.get("/abobo.png", (req, res)=>{
    res.sendFile(path.join(__dirname, "pages", "js", "mainJS", "animations", "abobo.png"));
});

app.get("/abobo_mirrored.png", (req, res)=>{
    res.sendFile(path.join(__dirname, "pages", "js", "mainJS", "animations", "abobo_mirrored.png"));
});

app.post("/", async (req, res) => {
    const user = req.body;
    const result = await db.verifyLogin(user.username, user.password);
    if (result) {
        const newToken = token();
        const tokenResult = await db.insert({username:user.username,token:newToken}, "tokens");
        if(tokenResult.status === 409){
            const updateToken = await db.update({username:user.username,token:newToken},"tokens");
            if(updateToken.err) return res.json(updateToken);

        }else if(tokenResult.err){
            return res.json(tokenResult);
        }
        if(id._idleTimeout) id=setInterval(async ()=>{await db.checkTokenDates()}, 1900000);
        return res.json({info:"Kirjautuminen onnistui", token:newToken});
    } else if (result.err) return res.json(result);
    else return res.json({err:"Käyttäjätiedot väärin"});
});

app.post("/newLogin", async (req, res) => {
    const user = req.body;
    if (!user.username || !user.password) {
        return res.json({ err: "Virheellinen data" });
    }

    const result = await db.insert(user, "users");
    res.json(result);
});

app.post("/token", async (req, res)=>{
    const user = req.body;
    let result = await db.search("tokens", "token", user.username);
    if(result.token && !result.err){
        result = db.compareTokens(user.token, result.token);
        return res.json({info:result});
    }else{
        return res.json(result.length > 0 ? result : {status:401});
    }
});

app.post("/logout", async (req, res)=>{
    const user = req.body;
    let result;
    if(user.username){
        // token check here
        result = await db.search("tokens", "token", user.username);
        //result.check === false
        if(result.err || result.length === 0){
            return res.json({err:"Token check fail", logoutURL:"http://localhost:3000"});
        }
        if(!result.err){
            if(user.token == result.token){
                result = await db.delete(false, "tokens", user.username);
                await db.delete(false, "players");
                if(result.info){
                    return res.json({logoutURL:"http://localhost:3000"});
                } 
            }
        }
    }
    if(result.err){
        return res.json({err:result.err});
    }else if(result == undefined){
        return res.json({err:"Jokin meni pahasti pieleen ulos kirjautuessa"});
    }
});

app.post("/delete", async (req, res)=>{ // rework? on aika sekava
    const user = req.body;
    if(user.username && user.password && user.token){
        // token check here
        let result = await db.search("tokens", "token", user.username);
        if(result.token){
            if(result.token == user.token){
                result = await db.verifyLogin(user.username, user.password);
            }else return res.json({err:"Token check fail", newURL:"http://localhost:3000"});
        }else if(!result.err) return res.json(result);
        else return res.json({err:"Token check fail", newURL:"http://localhost:3000"});

        if(result === true){
            result = await db.delete(true);
            if(result.err){
                return res.json({err:result.err});
            }
        }else if(!result){
            return res.json({err:"Kirjautumistiedot väärin!"});
            
        }else if(result.info){
            return res.json({info:result.info, newURL:"http://localhost:3000"});
        }
    }else{
        return res.json({err:"Käyttäjätunnuksia ei tullut palvelimelle"});
    }
});

app.post("/changePW", async (req, res)=>{
    const user = req.body;
    if(user.username && user.oldPW && user.newPW || user.newPW.length < 4){
        // token check here
        let result = await db.search("token", "token", user.username);
        if(!result.err && result.length > 0){
            if(result.token == user.token){
                result = await db.verifyLogin(user.username, user.oldPW);
            }
        }
        if(!result) return res.json({err:"Kirjautumistiedot väärin"});
        else if(result.check == false) return res.json({err:"Token check fail", newURL:"http://localhost:3000"});
        else{
            result = await db.updatePW(user.username, user.newPW);
            return res.json(result);
        }

    }else{
        return res.json({err:"Tiedot puutteelliset!"});
    }
});

app.post("/points", async (req, res)=>{
    const user = req.body;
    if(!user.username || !user.points || !user.token){
        if(!user.token) return res.json({err:"No token found", newURL:"http://localhost:3000", status:401});
        return res.json({err:"Käyttäjätiedot eivät tulleet palvelimelle"});
    }
    const tokenDB = await db.search("tokens", "token", user.username);
    if(tokenDB.err || tokenDB.length === 0) return res.json({err:"Token check fail", newURL:"http://localhost:3000", status:401});

    if(db.compareTokens(user.token, tokenDB.token)){
        const formattedUser = {username:user.username,points:user.points};
        const previousRecord = await db.search("points", "points", user.username);
        let result = {};
        if(previousRecord.lenght === 0) result = await db.insert(formattedUser, "points");
        else if(previousRecord.points < user.points) result = await db.update(formattedUser, "points");
        return res.json((Object.keys(result).lenght > 0 ? result : {info:true}));
    }
    return res.json({err:"Token check fail", newURL:"http://localhost:3000", status:401});
});

app.listen(port, async() =>{
    console.log("Servu tulil");
    await db.checkTokenDates();
    id = setInterval(async ()=>{await db.checkTokenDates(id)}, 1900000);
});