require("dotenv").config({path:`${__dirname}/.env`});

const mariadb = require("mariadb");
const bcrypt = require("bcrypt");

const pool = mariadb.createPool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:"projectx"
});

let conn;

module.exports = class Database{
    async insert(user, table){
        try{
            conn = await pool.getConnection();
            const checkTable = await conn.query("SHOW TABLES");
            if(checkTable.meta) delete checkTable.meta;
            let found = false;
            for(let item of checkTable){
                if(item.Tables_in_projectx === table){
                    found = true;
                    break;
                }
            }
            if(!found) return {err:"Haluttua taulukkoa ei ole olemassa"};

            const player = await this.search(table, "username", user.username);
            if(player.err) return player;
            else if(player.username && table === "users") return {err:"Käyttäjä on jo olemassa"};

            if(table === "users"){
                const res = await bcrypt.hash(user.password, 10).then(async (hash)=>{
                    
                    const result = await conn.query(`INSERT INTO ${table} VALUES(?,?)`, [user.username, hash]);
                    if(result.affectedRows > 0) return {info:"Tallennus onnistui"};
                    return {info:"Tallennus epäonnistui"};
                });
                return res;
            }

            const keys = Object.keys(user);
            const Qmarks = ("?,".repeat(keys.length)).slice(0, -1);
            const values = Object.values(user);
            const valuesArr = [];
            for(let value of values){
                valuesArr.push(value);
            }
            let keyString = "";
            for(let key of keys){
                keyString += `${key},`; 
            }
            keyString = keyString.slice(0, -1);

            const result = await conn.query(`INSERT INTO ${table} (${keyString}) VALUES(${Qmarks})`, valuesArr);
            if(result.affectedRows > 0) return {info:"Tallennus onnistui"};
            return {info:"Tallennus epäonnistui"};

        }catch(e){ // update API
            if(e.errno === 1062) return {status:409,err:"Käyttäjä on jo tietokannassa"}; 
            else if(e.errno === 1054) 
            return {status:400, err:"Tiedot virheelliset. Tarkista palvelimelle lähetetty data ja vertaa tietokannan taulukkoon"};
            else if(e.errno === 45028) return {status:500,err:"Tietokantaan ei saatu yhteyttä"};
            console.log(e);
            return {status:500, err:"Tallentamisen aikana tapahtui virhe"};
        }finally{
            if(conn) conn.end();
        }
    }

    async updatePW(username, password){ // create API
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
            if(e.errno === 45028) return {status:500,err:"Tietokantaan ei saatu yhteyttä"};
            return {status:500, err:"Virhe käyttäjätietojen päivityksessä!"};
        }finally{
            if(conn) conn.end();
        }
    }

    async update(user, table){
        if(!user.username || Object.keys(user).length < 2) return {info:false,err:"Vaaditut parametrit puuttuvat",status:400};
        try{
            conn = await pool.getConnection();
            const tables = await conn.query("SHOW TABLES");
            if(!table){
                const foundKeys = [];
                
                for(let item of tables){
                    foundKeys.push({table:item.Tables_in_projectx,params:"",values:[]});
                    const desc = await conn.query(`DESCRIBE ${item.Tables_in_projectx}`);
                    delete desc.meta;
                    for(let row of desc){
                        if(user[row.Field] !== undefined && row.Field !== "username"){
                            foundKeys[foundKeys.length - 1].params += `${row.Field}=?,`;
                            foundKeys[foundKeys.length - 1].values.push(user[row.Field]);
                        }
                    }
                    if(foundKeys[foundKeys.length - 1].params.length === 0) foundKeys.pop();
                }
                if(foundKeys.length === 0){
                    const keys = Object.keys(user);
                    for(let i = 0; i < keys.length; i++){
                        if(keys[i] === "username"){
                            keys.splice(i,1);
                            break;
                        }
                    }
                    return {info:false,err:`Haluttua tietoa '${keys}' ei ole olemassa`,status:400};
                } 
                const resultArr = [];
                for(let item of foundKeys){
                    item.params = item.params.slice(0,-1);
                    item.values.push(user.username);
                    const result = await conn.query(`UPDATE ${item.table} SET ${item.params} WHERE username=?`,item.values);
                    resultArr.push(item.table,result.affectedRows > 0 ? "Päivitys onnisui" : "Päivitys epäonnistui");
                }
                return {info:true,details:resultArr};
            }

            let found = false;
            for(let item of tables){
                if(item.Tables_in_projectx === table){
                    found = true;
                }
            }
            if(!found) return {info:false,err:"Haluttua taulukkoa ei ole olemassa",status:400};
            const desc = await conn.query(`DESCRIBE ${table}`);
            delete desc.meta;

            const keys = {
                params:"",
                values:[]
            };
            for(let item of desc){
                if(user[item.Field] !== undefined && item.Field !== "username"){
                    keys.params += `${item.Field}=?,`;
                    keys.values.push(user[item.Field]);
                }
            }
            if(keys.values.length === 0){
                delete user.username;
                const unfoundKeys = Object.keys(user);
                return {info:false,err:`Haluttua tietoa '${unfoundKeys.toString()}' ei ole olemassa`};
            } 

            keys.params = keys.params.slice(0,-1);
            keys.values.push(user.username);
            const result = await conn.query(`UPDATE ${table} SET ${keys.params} WHERE username=?`,keys.values);
            const resultArr = [table, result.affectedRows > 0 ? "Päivitys onnistui" : "Päivitys epäonnistui"];

            return {info: (result.affectedRows > 0 ? true : false),details:resultArr};  
        }catch(e){
            if(e.errno === 45028) return {status:500,err:"Tietokantaan ei saatu yhteyttä"};
            return {info:false,err:"Odottamaton virhe tapahtui päivityksessä",status:500};
        }finally{
            if(conn) conn.end();
        }
    }

    async search(table, params, username){
        try{
            conn = await pool.getConnection();
            const checkTable = await conn.query("SHOW TABLES");
            if(checkTable.meta) delete checkTable.meta;
            let found = false;
            for(let item of checkTable){
                if(item.Tables_in_projectx === table){
                    found = true;
                    break;
                }
            }
            if(!found) return {err:"Haluttua taulukkoa ei ole olemassa"};

            let result;
            if(!username){
                result = await conn.query(`SELECT ${params ? params : "*"} FROM ${table}`);
                if(result.meta) delete result.meta;
                return result;
            }

            result = await conn.query(`SELECT ${params} FROM ${table} WHERE username=?`, [username]);
            if(result.meta) delete result.meta;
            return result.length > 0 ? result[0] : result;

        }catch(e){
            if(e.errno === 45028) return {status:500,err:"Tietokantaan ei saatu yhteyttä"};
            return {status:500, err:"Virhe tietojen haussa tietokannasta"};
        }finally{
            if(conn) conn.end();
        }
    }

    async verifyLogin(username, password){
        try{
            let user = await this.search("users", "*", username);
            if(user.err) throw new Error(user.err);
            if(user.username){
                const check = await bcrypt.compare(password, user.password).then(result =>{
                    return result;
                });
                return check;
            }
            return false;
        }catch(e){
            console.log(e);
            return ({status: 500, err:(e.message ? e.message :"Virhe kirjautumistietojen tarkistuksessa")});
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
            if(e.errno === -4078) return {status:500,err:"Tietokantaan ei saatu yhteyttä"};
            return {status:500, err:"Virhe tokenien päivämäärän tarkistuksessa"}
        }finally{
            if(conn) conn.end();
        }
    }

    async delete(delAllContent, table, username){ // update API
        try{
            conn = await pool.getConnection();
            const tables = await conn.query("SHOW TABLES");
            if(delAllContent){
                const resultArr = [];
                for(let item of tables){
                    const result = await conn.query(`DELETE FROM ${item.Tables_in_projectx}`);
                    resultArr.push({table: item.Tables_in_projectx, affectedRows:result.affectedRows});
                }
                
                let resultJSON = {};
                for(let item of resultArr){
                    const itemJSON = {[item.table]:item.affectedRows > 0 ? true : false};
                    resultJSON = { ...resultJSON, ...itemJSON};
                }
                // pitäisi ehkä ilmoittaa jotenkin jos kaikista tauluista ei poistettu?
                return resultJSON = {...resultJSON, ...{info:"Poistaminen onnistui"}};      
            }
            let found = false;
            for(let item of tables){
                if(item.Tables_in_projectx === table){
                    found = true;
                    break;
                }
            }
            if(!found) return {err:"Haluttua taulukkoa ei ole olemassa"};
            let result
            if(username) result = await conn.query(`DELETE FROM ${table} WHERE username=?`, [username]);
            else result = await conn.query(`DELETE FROM ${table}`);
            
            if(result.affectedRows > 0) return {info:"Poisto onnistui"};
            return {err:"Poisto epäonnistui"};
        }catch(e){
            if(e.errno === -4078) return {status:500,err:"Tietokantaan ei saatu yhteyttä"};
            return {status:500, err:"Poiston aikana tapahtui virhe"};
        }finally{
            if(conn) conn.end();
        }
    }
}