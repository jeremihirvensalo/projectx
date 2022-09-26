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
    async insert(username, password){
        try{
            conn = await pool.getConnection();
            let result = await conn.query("SELECT username FROM users WHERE username=?", [username]);
            delete result.meta;
            if(result.length != 0){
                return {err:"Käyttäjä on jo olemassa"}
            }
            
            result = await bcrypt.hash(password, 10).then(async (hash) => {
                let data = await conn.query(`INSERT INTO users VALUES(?,?)`, [username, hash]);
                if(data.affectedRows > 0){
                    return {info:"Käyttäjän luonti onnistui"};
                }
                return {err:"Käyttäjän luonti epäonnistui"};
            });
            return result;
        }catch(e){
            return {err:"Käyttäjän luonti epäonnistui"};
        }finally{
            if(conn) conn.end();
        }
    }

    async insertPoints(username, points){
        try{
            conn = await pool.getConnection();
            // tarkista jos pisteet ovat jo olemassa. Jos on => ALTER
            let result = await conn.query(`INSERT INTO userPoints VALUES(?,?)`, [username, points]);
            if(result.affectedRows > 0){
                return {info:"Tallennus onnistui"}
            }
            return {err:"Tallennus epäonnistui"}
        }catch(e){
            return {err:"Virhe pisteiden tallennuksessa"}
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

    async searchUser(username){
        try{
            conn = await pool.getConnection();
            let userPW = await conn.query("SELECT password FROM users WHERE username=?",[username]);
            if(userPW[0].password){
                let userPoints = await conn.query("SELECT points FROM userPoints WHERE username=?",[username]);
                let user = {
                    username:username,
                    password:userPW[0].password
                };

                if(userPoints.points){
                    user = {
                        username:username,
                        password:userPW.password,
                        points:userPoints[0].points
                    }
                    return user;
                }else return user;
            }
            return {info:"Käyttäjää ei löydy"}
        }catch(e){
            return {err:"Virhe käyttäjän haussa tietokannasta"}
        }finally{
            if(conn) conn.end();
        }
    }

    async updatePoints(username, points){ // not ready. tarkista toimivuus kun/jos tarvitaan käyttää
        try{
            let user = await this.searchUser(username);
            if(user.username){
                conn = await pool.getConnection();
                let result = await conn.query("UPDATE userPoints SET points=? WHERE username=?",[points, username]);
                if(result.rowsAffected > 0){
                    return {info:"Tallennus onnistui"}
                }
                return {info:"Tallennus epäonnistui"}
            }
        }catch(e){
            return {err:"Virhe pisteiden tallennuksessa"}
        }finally{
            if(conn) conn.end();
        }
    }

    async deleteUser(username){
        try{
            let response = "Poisto onnistui: ";
            conn = await pool.getConnection();
            let result = await conn.query("DELETE FROM tokens WHERE username=?", [username]);
            if(result.affectedRows > 0) response += "tokeneista ";
            //lisää poisto taulusta userPoints kun sitä aletaan käyttämään
            result = await conn.query("DELETE FROM users WHERE username=?", [username]);
            if(result.affectedRows > 0) response += "käyttäjistä "
            return {info:response};
        }catch(e){
            return {err:"Virhe käyttäjän poistossa"}
        }finally{
            if(conn) conn.end();
        }
    }

    async verifyLogin(username, password){
        try{
            let user = await this.searchUser(username);
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

    async insertToken(username, tkn){
        try{
            conn = await pool.getConnection();

            const checkForToken = await this.searchToken(username);
            let result;
            if(checkForToken.username != undefined){
                result = await conn.query("UPDATE tokens SET token=?, date=CURRENT_TIMESTAMP WHERE username=?", [tkn, username]);
            }else{
                result = await conn.query("INSERT INTO tokens VALUES(?,?,CURRENT_TIMESTAMP)", [username, tkn]);
            }
            if(result.affectedRows > 0){
                return {info:"Tokenin tallennus onnistui"}
            }
            return {err:"Tokenin tallennus epäonnistui"}
        }catch(e){
            console.log(e);
            return {err:"Virhe tokenin tallennuksessa"}
        }finally{
            if(conn) conn.end();
        }
    }

    async searchToken(username){
        try{
            conn = await pool.getConnection();
            const result = await conn.query("SELECT * FROM tokens WHERE username=?", [username]);
            delete result.meta;
            if(result.length != 0){
                return result[0];
            }
            return {err:"Käyttäjälle ei löytynyt tokenia", check:false}
        }catch(e){
            return {err:"Virhe tokenin haussa", check:false}
        }finally{
            if(conn) conn.end();
        }
    }

    compareTokens(userToken, dbToken){
        if(userToken == dbToken) return true;
        return false;
    }

    async deleteToken(username){
        try{
            let result = await this.searchToken(username);
            // check user if found delete if not => err
            if(result.username){
                conn = await pool.getConnection();
                result = await conn.query("DELETE FROM tokens WHERE username=?", [username]);
                
                if(result.affectedRows > 0){
                    return {info:`Käyttäjän ${username} tokeni poistettu`}
                }
                return {err:"Jokin meni pieleen, eikä käyttäjää poistettu"};
            }
            return {err:"Tokenia ei löytynyt"};
        }catch(e){
            console.log(e);
            return {err:"Virhe tokenin poistossa"};
        }finally{
            if(conn) conn.end();
        }
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
}