const mariadb = require("mariadb");
const bcrypt = require("bcrypt");

const pool = mariadb.createPool({
    host:"localhost",
    port:3307,
    user:"root",
    password:"1234",
    database:"projectx"
});

let conn;

module.exports = class Database{
    async insert(user, table){ // rework needed
        try{
            conn = await pool.getConnection();
            let result;

            if(table === "users"){
                result = await conn.query(`SELECT username FROM users WHERE username=?`, [user.username]);
                if(!result.meta) new Error();
                delete result.meta;
                if(result.length != 0){
                    return {err:"Käyttäjä on jo olemassa"}
                }
    
                result = await bcrypt.hash(user.password, 10).then(async (hash) => {
                    let data = await conn.query(`INSERT INTO ${table} VALUES(?,?)`, [user.username, hash]);
                    if(data.affectedRows > 0){
                        return {info:"Käyttäjän luonti onnistui"};
                    }
                    return {err:"Käyttäjän luonti epäonnistui"};
                });
                return result;
            }else if(table === "userPoints"){
                result = await conn.query("SELECT username FROM userPoints WHERE username=?",[user.username]);
                delete result.meta;
                if(result.length != 0){
                    result = await conn.query(`UPDATE ${table} SET points=? WHERE username=?`, [user.points, user.username]);
                    if(result.affectedRows > 0) return {info:"Pisteden tallennus onnistui"};
                    return {err:"Pisteiden tallennus epäonnistui"};
                }
                result = await conn.query(`INSERT INTO ${table} VALUES(?,?)`, [user.username, user.points]);
                if(result.affectedRows > 0) return {info:"Pisteiden tallennus onnistui"};
                return {err:"Pisteiden tallennus epäonnistui"}
            }else if(table === "tokens"){
                const checkForToken = await this.search("tokens", "*", user.username);
                if(checkForToken.username != undefined){
                    result = await conn.query("UPDATE tokens SET token=?, date=CURRENT_TIMESTAMP WHERE username=?", [user.token, user.username]);
                }else{
                    result = await conn.query("INSERT INTO tokens VALUES(?,?,CURRENT_TIMESTAMP)", [user.username, user.token]);
                }
                if(result.affectedRows > 0){
                    return {info:"Tokenin tallennus onnistui"};
                }
                return {err:"Tokenin tallennus epäonnistui"};
            }else if(table === "players"){
                let result = await conn.query("SELECT * FROM players");
                if(result.meta) delete result.meta;
                if(result.length === 2) return {err:"Tietokanta on täynnä pelaajia"};

                for(let player of result){
                    if(player.username === user.username){
                        return {err:"Käyttäjänimi on jo varattu toiselle pelaajalle"};
                    }
                }

                result = await conn.query("INSERT INTO players VALUES(?,?,?,?,?)",[user.username, user.x, user.y, user.w, user.h]);
                if(result.affectedRows > 0) return {info:"Lisäys onnistui"};
                return new Error();
            }
        }catch(e){
            return {err:"Tallennus epäonnistui"};
        }finally{
            if(conn) conn.end();
        }
    }

    async updatePW(username, password){
        try{
            conn = await pool.getConnection();
            let result = await bcrypt.hash(password, 10).then(async (hash)=>{
                let data = await conn.query("UPDATE users SET password=? WHERE username=?", [hash, username]);
                if(data.affectedRows > 0){
                    return {info:"Päivitys onnistui"};
                }
                return {err:"Päivitys epäonnistui"};
            });
            return result;
        }catch(e){
            return {err:"Virhe käyttäjätietojen päivityksessä!"};
        }finally{
            if(conn) conn.end();
        }
    }

    async search(table, params, username){ // update API
        try{
            conn = await pool.getConnection();
            let result;
            if(!username){
                result = await conn.query(`SELECT ${params} FROM ${table}`);
                if(result.meta) delete result.meta;
                return result;
            }

            result = await conn.query(`SELECT ${params} FROM ${table} WHERE username=?`, [username]);
            if(result.meta) delete result.meta;
            return result.length > 0 ? result[0] : result;

        }catch(e){
            return {err:"Virhe tietojen haussa tietokannasta"};
        }
    }

    async verifyLogin(username, password){
        try{
            let user = await this.search("users", "*", username);
            if(user.username){
                const check = await bcrypt.compare(password, user.password).then(result =>{
                    return result;
                });
                return check;
            }
            return false;
        }catch(e){
            return ({err:"Virhe kirjautumistietojen tarkistuksessa"});
        }finally{
            if(conn) conn.end();
        }
    }

    compareTokens(userToken, dbToken){
        if(userToken == dbToken) return true;
        return false;
    }


    async checkTokenDates(id){ // tarkistaa jokaisen tokenin ja poistaa jos on yli tunnin vanha
        try{
            conn = await pool.getConnection();
            const tokens = await conn.query("SELECT username, date FROM tokens");
            delete tokens.meta;
            if(tokens.length == 0){
                clearInterval(id);
                return {info:"Mitään ei poistettu"};
            }
            const d = new Date().getTime();
            
            const poistettava = [];
            tokens.forEach(item =>{
                const cookieD = new Date(item.date).getTime();
                const erotus = d - cookieD;
                if(erotus > 3600000){ //ero täytyy olla vähemmän kuin 3,6 miljoonaa eli 1 tunti
                    poistettava.push(item.username);
                }
            });
            
            if(poistettava.length != 0){ // ghetto ahh solution
                let sqlQuery = "DELETE FROM tokens WHERE ";
                for(let i = 0; i < poistettava.length; i++){
                    if(poistettava[i + 1] == undefined){
                        sqlQuery += "username=? ";
                    }else{
                        sqlQuery += "username=? OR ";
                    }
                }
                const result = await conn.query(sqlQuery, poistettava);
                if(result.affectedRows > 0){
                    return {info:poistettava}
                }
            }
            return {info:null};
        }catch(e){
            return {err:"Virhe tokenien päivämäärän tarkistuksessa"}
        }finally{
            if(conn) conn.end();
        }
    }

    async delete(username, key){
        try{
            conn = await pool.getConnection();
            if(!key){
                const deleteUser = await conn.query("DELETE FROM users WHERE username=?", [username]);
                const deleteToken = await conn.query("DELETE FROM tokens WHERE username=?", [username]);
                const deletePoints = await conn.query("DELETE FROM userPoints WHERE username=?", [username]);
                return {
                    user:deleteUser.affectedRows > 0 ? true : false,
                    token:deleteToken.affectedRows > 0 ? true : false,
                    points:deletePoints.affectedRows > 0 ? true : false,
                    info:"Poistaminen onnistui"
                };
            }else if(key === "token"){
                const result = await conn.query("DELETE FROM tokens WHERE username=?", [username]);
                if(result.affectedRows > 0){
                    return {info:"Poistaminen onnistui"};
                }
                return {err:"Poistossa meni jokin pieleen, mitään ei poistettu"};
            }

        }catch(e){
            return {err:"Poistaminen epäonnistui"};
        }finally{
            if(conn) conn.end();
        }

    }
}