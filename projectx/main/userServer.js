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

app.post("/", async (req, res) => {
    const user = req.body;
    const result = await db.verifyLogin(user.username, user.password);
    if (result) {
        const newToken = token();
        await db.insertToken(user.username, newToken);
        if(id._idleTimeout) id=setInterval(async ()=>{await db.checkTokenDates()}, 1900000);
        res.json({info:"Kirjautuminen onnistui", token:newToken});
    } else if (result.err) res.json(result.err);
    else return res.json({err:"Käyttäjätiedot väärin"});
});

app.post("/newLogin", async (req, res) => {
    const user = req.body;
    if (user.username == null || user.password == null) {
        res.json({ err: "Virheellinen data" });
    }
    const result = await db.insert(user.username, user.password);
    
    res.json(result);
});

app.post("/token", async (req, res)=>{
    const user = req.body;
    let result = await db.searchToken(user.username);
    if(result.err == undefined){
        result = db.compareTokens(user.token, result.token);
        res.json({info:result});
    }else{
        res.json({err:result.err});
    }
});

app.post("/logout", async (req, res)=>{
    const user = req.body;
    let result;
    if(user.username){
        result = await db.searchToken(user.username);
        if(!result.err){
            if(user.token == result.token){
                result = await db.deleteToken(user.username);
                if(result.info){
                    res.json({logoutURL:"http://localhost:3000"});
                } 
            }
        }
    }
    if(result.err){
        res.json({err:result.err});
    }else if(result == undefined){
        res.json({err:"Jokin meni pahasti pieleen ulos kirjautuessa"});
    }else if(result.check == false){
        res.json({err:"Token check fail", logoutURL:"http://localhost:3000"});
    }
});

app.post("/delete", async (req, res)=>{
    const user = req.body;
    if(user.username && user.password && user.token){
        let result = await db.searchToken(user.username);
        if(!result.err){
            if(result.token == user.token){
                result = await db.verifyLogin(user.username, user.password);
            }
        }
        
        if(result == true){
            result = await db.deleteUser(user.username);
            if(result.err){
                res.json({err:result.err});
            }
        }else{
            if(result.check == false){
                res.json({err:"Token check fail", newURL:"http://localhost:3000"});
            }
            if(!result){
                res.json({err:"Kirjautumistiedot väärin!"});
            }
        }
        
        if(result.info){
            res.json({info:result.info, newURL:"http://localhost:3000"});
        }
    }else{
        res.json({err:"Käyttäjätunnuksia ei tullut palvelimelle"});
    }
});

app.post("/changePW", async (req, res)=>{
    const user = req.body;
    if(user.username && user.oldPW && user.newPW || user.newPW.length < 4){
        let result = await db.searchToken(user.username);
        if(!result.err){
            if(result.token == user.token){
                result = await db.verifyLogin(user.username, user.oldPW);
            }
        }
        if(!result){
            res.json({err:"Kirjautumistiedot väärin"});
        }else if(result.check == false){
            res.json({err:"Token check fail", newURL:"http://localhost:3000"});
        }else if(result){
            result = await db.updatePW(user.username, user.newPW);
            res.json(result);
        }else{
            res.json(result.err);
        }
    }else{
        res.json({err:"Tiedot puutteelliset!"});
    }
});

app.listen(port, async() =>{
    console.log("Servu tulil");
    await db.checkTokenDates();
    id = setInterval(async ()=>{await db.checkTokenDates(id)}, 1900000);
});