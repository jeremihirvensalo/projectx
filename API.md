# Project X API

# Login
    Jotta käyttäjä saa pääsyn sivulle täytyy kirjautua sivulle.
    Kirjautuminen tapahtuu syöttämällä kenttään nimen ja salasanan.
    Jos ei ole tunnuksia voidaan ne luoda painamalla "luo tunnukset" nappia.
    Nappi avaa kirjautumis-sivun.
    Tunnukset tallennetaan tietokantaan.

## Tunnusten luonti
    Tunnus luodaan antamalla nimi (joka ei voi olla jo olemassa) ja salasana.
    - Jos nimi on jo olemassa ilmoittaa siitä sivu virheilmoituksella.
    - Jos luonti onnistuu ilmoitetaan siitä käyttäjälle ja hänet viedään takaisin
        kirjautumis-sivulle.

### Salasana
    Salasanan täytyy olla 4 - 30 merkin väliltä.
    Salasanat "suolataan" bcrypt moduulilla ennen tietokantaan tallentamista.
    - Jos tunnuksia yritetään luoda liian lyhyellä tai pitkällä
        salasanalla, ilmoitetaan siitä virheilmoituksella.


## Kirjautuminen
    Kirjautuminen tapahtuu syöttämällä kenttiin nimi ja salasana.
    - Jos salasana ja tunnus ei täsmää ilmoitetaan siitä virheilmoituksella.
    - Jos kirjautuminen onnistuu käyttäjä viedään pääsivulle.


## Tietokanta
    Tietokantaan tallennetaan käyttäjän nimi ja salasana.
    Käytössä on SQL tietokanta.

    esim. 
    | username | password |
    | -------- | -------- |
    | pelaaja1 | salasana |
    | pelaaja2 | salasana |


# loginPost.js

    Tarkistaa ja lähettää REST-palvelimelle kirjautumistiedot.

### validateLogin(username, password)
    Funktio varmistaa, että kirjautumistiedot ovat hyväksytyn 
    pituisia.
    Parametreiksi funktio ottaa käyttäjätunnuksen ja salasanan.
    Käyttäjätunnus täytyy olla vähintää yhden merkin pituinen ja
    salasanan täytyy olla 4 ja 30 merkin väliltä.

```js
validateLogin("pelaaja1", "salasana1");
```

palauttaa `true`

```js
validateLogin("", "salasana1");
```

ja

```js
validateLogin("pelaaja1", "");
```

ja

```js
validateLogin("", "");
```

ja

Salasana liian pitkä.
```js
validateLogin("pelaaja1", "aaaaaa...aaa"); 
```

palauttaa `false`


# db.js

    "Puhuu" tietokannan kanssa eli kirjoittaa ja hakee 
    dataa tietokannasta.

## HUOM!

    .env.example täytyy kopioida ja kopion nimi muuttaa muotoon .env
    KOPIOON (ei siis .env.example) kuuluu kirjoittaa MariaDB käyttäjätunnukset, host ja port
    Jos tätä ei ole tehty, ei tietokanta toimi

## Database

    Luokka joka sisältää tietokantaan liittyvät funktiot.


```js
new Database();
```

Luo `Database` luokan


### insert(user, table)
    Kirjoittaa tietokantaan dataa. 
    Parametreiksi funktio ottaa käyttäjäntiedot json-muodossa ja
    taulukon nimen johon halutaan lisätä tieto. Käyttäjätietojen pitää sisältää
    ainakin käyttäjänimi.
    Funktioon ei pitäisi olla mahdollista syöttää virheellisessä muodossa käyttäjätietoja, 
    sillä se tarkistetaan ennen funktion käyttöä.
    Funktio palauttaa onnistuneessa ja virhetilanteessa
    dataa json muodossa.

Onnistuneessa tilanteessa palauttaa
```json
{
    "info":"Tallennus onnistui"
}
```

Epäonnistuneessa tilanteessa palautta
```json
{
    "err":"Tallennus epäonnistui"
}
```

Jos haluttu taulukko on `users` ja sieltä löytyy jo syötetyllä
käyttäjänimellä tietoja, palauttaa
```json
{
    "err":"Käyttäjä on jo olemassa"
}
```

Jos syötettyä taulukkoa ei löydy palauttaa
```json
{
    "err":"Haluttua taulukkoa ei ole olemassa"
}
```

Virhetilanteessa palauttaa
```json
{
    "err":"Tallentamisen aikana tapahtui virhe"
}
```

#### user-taulu
    Sisältää käyttäjänimen (string) ja salasanan (string).
    Salasana on suojattu bcryptillä. 
    Molemmat tiedot ovat pakollisia taulukkoon lisätessä.

#### tokens-taulu
   Sisältää käyttäjänimen (string), käyttäjän tokenin (string) ja lisäysaika (datetime).
   Käyttäjänimi ja tokeni ovat pakollisia tietoja tietokantaa lisätessä. Lisäysaika
   syöttää itsensä automaattisesti, joten sitä ei ole pakollista antaa tietokannalle.

#### points-taulukko
    Sisältää käyttäjänimen (string) ja pelaajan piste-ennätyksen (integer).
    Molemmat tiedot ovat pakollisia taulukkoon lisätessä. 

#### players-taulukko
    Sisältää käyttäjänimen (string), pelaajan osumapisteet (integer), pelaajan koordinaatit (x (integer), y (integer)),
    pelaajan leveyden (integer), pelaajan pituuden (integer), osumapisteet (integer) ja blockstate (boolean).
    Kaikki tiedot ovat pakolliset taulukkoon lisätessä.

### search(table, params, username)
    Etsii tietokannasta käyttäjän tiedot.
    Funktio palauttaa listassa etsityt kohteet tai json-muodossa jos etsittiin 
    vain tiettyä asiaa tietokannasta. Eli jos siis parametri `username` on määritelty (eli ei tyhjä) 
    palauttaa json-olion. Jos parametri `username` ei ole määritelty palauttaa 
    funktio listan, joka sisältää halutut kohteet json-muodossa tai tyhjän listan 
    jos mitään ei löydetty.
    Parametrit: table (string) taulukko mistä halutaan tieto, params (string) ottaa vastaan taulukon rivin avaimen
    kuten esimerkiksi `password` tai `*` , jolloin palautetaan kaikkien löydettyjen rivijen tiedot, username (string)
    käyttäjänimi, jonka tiedot halutaan.
    `username` ei ole pakollinen parametri, mutta muut ovat.

Oletetaan esimerkin vuoksi, että users-taulukko sisältää
seuraavat tiedot (merkitty json-muotoon selvyyden vuoksi):

```json
[
    {
        "username":"pelaaja1",
        "password":"salasana1"
    },
    {
        "username":"pelaaja2",
        "password":"salasana2"
    }
]
```

Jos etsitään koko users-taulukko
```js
const db = new Database();
db.search("users", "*");
```

Palauttaa
```json
[{"username":"pelaaja1","password":"salasana1"}, {"username":"pelaaja2","password":"salasana2"}]
```

Jos etsitään käyttäjää `pelaaja1`
```js
const db = new Database();
db.search("users", "*", "pelaaja1");
```

Palauttaa
```json
{
    "username":"pelaaja1",
    "password":"salasana1"
}
```

Jos etsitään käyttäjä `pelaaja2`, mutta halutaan vain
käyttäjänimi
```js
const db = new Database();
db.search("users", "username", "pelaaja2");
```

Palauttaa
```json
{
    "username":"pelaaja2"
}
```

Jos halutaan etsiä kaikki salasanat
```js
const db = new Database();
db.search("users", "password");
```

Palauttaa
```json
[{"password":"salasana1"},{"password":"salasana2"}]
```

Jos mitään ei löydy jossain tilanteessa palauttaa tyhjän listan ([])


Jos funktioon syötettyä taulukkoa ei ole tietokannassa palauttaa
```json
{
    "err":"Haluttua taulukkoa ei ole olemassa"
}
```

Virhetilanteessa palauttaa
```json
{
    "err":"Virhe tietojen haussa tietokannasta"
}
```

### delete(delAllContent, table, username)
    Funktio poistaa tietokannasta tietoja.
    Parametreiksi ottaa username (string) käyttäjänimi ja table (string) taulukon josta tieto
    halutaan poistaa. delAllContent on boolean ja jos se on `true`, poistuu KAIKISTA tauluista KAIKKI tiedot.
    Jos `delAllContent` parametri on `true` Funktio palauttaa onnistuneessa tilanteessa 
    JSON-muodossa tiedon, että mistä tietoa on yritetty poistaa ja onko jotain poistettu (boolean).
    Jos `table` on määritelty palauttaa funktio JSON-muodossa onnistuiko poistaminen vai ei.
    Jos parametri `table` on määritelty, mutta username ei, poistuu halutusta taulusta kaikki tiedot.
    Jos myös `username` on määritelty, poistetaan halutusta taulusta kyseisen käyttäjän tiedot.

    Oletetaan esimerkin takia, että tietokannassa on taulut "users", "points" ja "tokens"
    "users"-taulu sisältö:
```json
[
    {
        "username":"pelaaja1",
        "salasana":"salasana1"
    },
    {
        "username":"pelaaja2",
        "salasana":"salasana2"
    }
]
```

    "points"-taulun sisältö:
```json
[
    {
        "username":"pelaaja1",
        "points":1000
    }
]
```

    "tokens"-taulu on tyhjä


    Poistetaan käyttäjä "pelaaja1" ilman `table` parametria:
```js
const db = new Database();
db.delete("pelaaja1");
```

Palauttaa
```json
{
    "users":true,
    "points":true,
    "tokens":false,
    "info":"Poistaminen onnistui"
}
```
    
    Poistetaan käyttäjä "pelaaja1" kun `table` parametri on "users"
```js
const db = new Database();
db.delete("pelaaja1", "users");
```

Palauttaa
```json
{
    "info":"Poisto onnistui"
}
```

Jos tietystä taulusta poistaminen epäonnistuu palauttaa
```json
{
    "err":"Poisto epäonnistui"
}
```

Virhetilanteessa funktio palauttaa
```json
{
    "err":"Poiston aikana tapahtui virhe"
}
```

### update(user, table)
    Päivittää käyttäjän tiedot halutusta taulusta tai kaikista tauluista joista hänet löydetään.
    funktio ottaa vastaan user(json-object) parametrin, joka sisältää käyttäjätunnuksen kuten myös ainakin yhden uuden arvon 
    joka halutaan päivittää. Parametri table(string) sisältää taulukon nimen, josta tieto halutaan päivittää. Jos table-parametria ei
    olla määritelty päivittää funktio kaikista taulukoista käyttäjän tiedot. `user` parametri on pakollinen, mutta `table` ei. 
    Funktio palauttaa json-muodossa vastauksen, joka sisältää kaikki taulukot joihin on tehty tai yritetty tehdä muutoksia ja niiden tulokset, 
    kuten myös booleanin ilmoittamaan nopeasti tekikö ohjelma mitään.

(Esimerkeissä oletetaan, että lukija tietää minkälaisia tietokannan taulujen rakenteet ovat. Jos et tiedä katso
main => pages => database => sql => createDB.sql tai lue ylempää)

Funktioon laitetaan seuraavat tiedot
```js
update({username:"123",token:"randtoken"},"tokens");
```
Palauttaa onnistuneessa tilanteessa:
```json
{
    "info":true,
    "details":["tokens","Päivitys onnistui"]
}
```

Funktioon voi laittaa monelle taululle tietoja samaan aikaan:
```js
const obj = {
    username:"123",
    token:"randtoken",
    points:2000
}

update(obj);
```
(HUOM! JOTTA ERITAULUJEN TIETOJEN PÄIVITYS ONNISTUU YHDELLÄ KUTSULLA, EI `table` SAA OLLA MÄÄRITELTY)
Palauttaisi onnistuneessa tilanteessa:

```json
{
    "info":true,
    "details":[
        "tokens",
        "Päivitys onnistui",
        "points",
        "Päivitys onnistui"
    ]
}
```

Epäonnistuneessa tilanteessa palautuu:
```json
{
    "info":false,
    "err":"Odottamaton virhe tapahtui päivityksessä",
    "status":500
}
```

Jos `user` parametri on tyhjä tai sieltä puuttuu vaaditut minimitiedot:
```json
{
    "info":false,
    "err":"Vaaditut parametrit puuttuvat",
    "status":400
}
```

Jos `user` parametri sisältää minimitiedot, mutta päivitetyksi haluttua tieto ei löydy tietokannasta:
```json
{
    "info":false,
    "err":"Haluttua tietoa *parametri esim. 'voitot'* ei ole olemassa",
    "status":400
}
```

Jos `user` parametri sisältää tietoja jotka löytyvät ja joita ei löydy:
```json
{
    "info":true,
    "details":[
        "points",
        "Päivitys onnistui"
    ],
    "err":"Haluttua tietoa *parametri esim. 'voitot'* ei ole olemassa"
}
```

Jos `user` parametri sisältää monesta taulusta tietoja, mutta `table` on määritelty:
```js
const obj = {
    username:"123",
    token:"randtoken",
    points:2000
}

update(obj,"tokens");
```
Palauttaa
```json
{
    "info":true,
    "details":[
        "tokens",
        "Päivitys onnistui"
    ]
}
```

Jos `table` parametri ei ole yksi tietokannan taulukoista:
```json
{
    "info":false,
    "err":"Haluttua taulukkoa ei ole olemassa",
    "status":400
}
```

### verifyLogin(username, password)
    Tarkistaa, että käyttäjätunnus ja salasana ovat samat.
    Funktio palauttaa true tai false vastauksen ja ottaa parametreiksi
    käyttäjätunnuksen ja salasanan

Oletetaan, että tietokannassa on `"pelaaja1"` salasanalla `"salasana1"`

```js
const db = new Database();
db.verifyLogin("pelaaja1", "salasana1");
```

palauttaa `true`

```js
const db = new Database();
db.verifyLogin("pelaaja1", "ssss");
```

palauttaa `false`

```js
const db = new Database();
db.verifyLogin("pelaaja123", "salasana1");
```

palauttaa `false`

Virhetilanteessa palauttaa
```json
{
    "err":"Virhe kirjautumistietojen tarkistuksessa"
}
```

### compareTokens(userToken, dbToken)
    Vertailee tietokannasta saatua tokenia käyttäjän tokeniin
    Palauttaa vertailun onnistuessa `true` ja sen epäonnistuessa `false`


### checkTokenDates()
    Käy läpi kaikki tallennetut tokenit ja poistaa yli tunnin vanhat tallennukset.
    Funktio on parametriton.

Jos tokens-talukko on tyhjä palauttaa
```json
{
    "info":"Mitään ei poistettu"
}
```

Onnistuneessa tilanteessa palauttaa jsonissa `null` tai jos
jotain on poistettu niin taulukossa poistettujen tokenien omistajien
nimet.
Esim. `pelaaja1` ja `pelaaja2` tokenit poistettiin palauttaa
```json
{
    "info":["pelaaja1","pelaaja2"]
}
```

Jos mitään ei poistettu palauttaa
```json
{
    "info":null
}
```

Virhetilanteessa palauttaa
```json
{
    "err":"Virhe tokenien päivämäärän tarkistuksessa"
}
```


# functions.js

    Sisältää apufunktioita login-sivulle.


### displayLogin()
    Näyttää sivulle kirjautumis-sivun samalla kun poistaa rekisteröitymis-sivun
    pois näkyvistä. Funktio on parametriton.

### displaySignUp()
    Näyttää sivulle rekisteröitymis-sivun samalla kun poistaa kirjautumis-sivun
    pois näkyvistä. Funktio on parametriton.

### clearLoginInputs()
    Poistaa kirjautumis-sivun syötekenttiin annetut tiedot.
    Funktio on parametriton.

### clearSignUpInputs()
    Poistaa rekisteröitymis-sivun syötekenttiin annetut tiedot.
    Funktio on parametriton.

### clearInfo()
    Poistaa infoalueen tekstin. Funktio on parametriton.


# cookies.js
    Evästeisiin liittyvät funktiot.

### createCookie(username, token)
    Luo käyttäjälle evästeen, jossa on hänen käyttäjänimi ja tokeni.

Esim. (oletetaan, että kello on tasan 12 ja päivämäärä 22.8.2022)
```js
createCookie("pelaaja1", "token12");
```

Luo käyttäjälle evästeet:
`username=pelaaja1 expires=Mon 22 Aug 2022; path=http://localhost:3000/main`
ja
`token=token12 expires=Mon 22 Aug 2022; path=http://localhost:3000/main`


# kirjautumispalvelin
    Käyttäjähallinta. Eli hoitaa käyttäjiin liittyvien tiedonkäsittelyn.

## userServer.js
    Toimii käyttäjän ja tietokannan "välikätenä".
    Palauttaa sivut mahdollisen datan kanssa.

### token()
    Luo uuden tokenin. Tokeni muodostuu täysin satunnaisista luvuista ja kirjaimista.
    Funktio on parametriton.

Reitit:
`http://localhost3000`...

### GET /
    Lähettää kirjautumis-sivun.

### GET /main
    Lähettää pääsivun.

### POST /
    Ottaa vastaa kirjautumistiedot ja tarkistaa ne.
    Palvelin vastaa json-datalla. Kun kirjautuminen
    onnistuu luodaan käyttäjälle uusi tokeni.

Onnistuneessa tilanteessa palauttaa
```json
{
    "info":"Kirjautuminen onnistui",
    "token":"token"
}
```

Epäonnistuneessa kirjautumisessa palauttaa
```json
{
    "err":"Käyttäjätiedot väärin"
}
```

Virhetilanteessa palauttaa
```json
{
    "err":"#virhe#"
}
```
`#virhe#` kohdalla on tietokannan funktiosta `verifyLogin()` saatu virheilmoitus.

### POST /newLogin
    Käsittelee rekisteröitymisen. Ottaa vastaan käyttäjänimen ja salasanan.
    
Jos salasana tai käyttäjänimi on tyhjä/null palauttaa
```json
{
    "err":"Virheellinen data"
}
```

Muissa tilanteissa palauttaa tietokannan `insert()` funktion tuloksen.

### POST /token
    Vertailee tietokannan ja käyttäjän tokeneita.
    Ottaa vastaan käyttäjänimen ja tokenin.

Jos käyttäjälle ei löydy tokenia palauttaa
```json
{
    "err":"Käyttäjälle ei löytynyt tokenia"
}
```
tai jos haussa tapahtui virhe
```json
{
    "err":"Virhe tokenin haussa"
}
```

Jos käyttäjän tokeni pystytään vahvistamaan palauttaa 
```json
{
    "info":true
}
```
ja jos ei 
```json
{
    "info":false
}
```

### POST /logout
    Poistaa käyttäjän tokenin eli kirjautuu käyttäjän ulos.
    Ottaa vastaan käyttäjänimen.

Onnistuneessa tilanteessa palauttaa
```json
{
    "logoutURL":"http://localhost:3000"
}
```

Virhetilanteessa palauttaa
```json
{
    "err":"Jokin meni pahasti pieleen ulos kirjautuessa"
}
```
tai
```json
{
    "err":"#virhe#"
}
```
`#virhe#` kohdalla on tietokannan funktion `deleteToken()` virhetilanteen palautus.

### POST /delete
    Poistaa käyttäjän ja hänen tokenin tietokannasta.
    Ottaa vastaan käyttäjänimen.

Onnistuneessa tilanteessa palauttaa
```json
{
    "info":"#info#", 
    "newURL":"http://localhost:3000"
}
```
`#info#` kohdalla on tietokannan funktion `deleteUser()` onnistuneen tilanteen palautus.

Jos käyttäjätiedot eivät olleet oikeanlaiset tai niitä ei ollut ollenkaan palauttaa
```json
{
    "err":"Käyttäjätunnuksia ei tullut palvelimelle"
}
```

Virhetilanteessa palauttaa
```json
{
    "err":false
}
```
tai
```json
{
    "err":"#virhe#"
}
```
`#virhe#` kohdalla on tietokannan funktion `deleteUser()` virhetilanteen palautus.


# Main


## checkToken.js
    Tarkistaa käyttäjän tokenin REST-palvelimelta.
    Jos tokenia ei pystytä vahvistamaan käyttäjä
    Ohjataan kirjautumis-sivulle.
    Jos taas tokeni pystytään vahvistaamaan,
    mitään ei tapahdu.

### getCookieValue(cookie)
    Palauttaa parametriksi annetun evästeen arvon.

Esim. oletetaan, että on luotu eväste `username=pelaaja1 expires...`
```js
getCookieValue("username");
```
Palauttaa `pelaaja1`


## listener.js
    Kuuntelee painalluksia main-sivulla. Näyttää ja sulkee
    käyttäjän asetus-sivua.

## displayCookies.js
    Näyttää käyttäjän nimen sivulla.


# Pelipalvelin
    Hoitaa pelin toiminnan.

## setupCanvas.js
    Käsittelee pelin aloituksen.

### start()
    Parametriton(?) funktio, joka aloittaa pelin luomalla canvaksen ja tarvittavat luokat.

### showPoints(points)
    Funktio, joka päivittää sivulle pelaajan pisteet. Parametriksi ottaa pelaajan pisteet (integer)

### returnPlayers()
    Parametriton funktio, joka palauttaa molemmat pelaaja-oliot. Vaikka pelaajia ei olisi vielä määritelty,
    voidaan funktio kutsua. Siinä tilanteessa palautuisi:
```json
{
    "player":"undefined",
    "bot":"undefined"
}
```

### formatPlayer(player, isBot)
    Funktio laittaa pelaaja-oliot oikeaan muotoon palvelinta varten. Jos halutaan käsitellä botin pelaaja-olio 
    täytyy parametri `isBot` olla `true`, muuten `false`. Jos käsitellään oikean pelaajan oliota `isBot` parametria
    ei täydy edes määritellä.
    Ottaa vastaan player (player-olio) ja isBot (boolean). Vastaus tulee json-muodossa.

Jos pelaaja-olio on pelaajan:
```json
{
    "username":"pelaaja1",
    "x":100,
    "y":100,
    "w":100,
    "h":100,
    "hp":100,
    "blockstate":false,
    "token":"randtoken123"
}
```

Jos kysessä on botti:
```json
{
    "username":"botti",
    "x":100,
    "y":100,
    "w":100,
    "h":100,
    "hp":100,
    "blockstate":false
}
```

### addPlayer(player, isBot)
    Funktio käsittelee pelaaja-olion ja lähettää sen palvelimelle lisättäväksi peliin.
    Ottaa vastaa player (pelaaja-olio) ja isBot (boolean). Jos `isBot` on `true`, käsittelee 
    funktio pelaaja-olion bottina.
    Palauttaa json-muodossa vastauksen.

Onnistuneessa tilanteessa palauttaa:
```json
{
    "info":true,
    "username":"pelaaja1"
}
```

Jos jokin menee pieleen:
```json
{
    "info":false,
    "err":"Virhe pelaajan '*pelaajan nimi*' lisäyksessä",
    "username":"pelaaja1"
}
```

Jos ohjelma hajoaa:
```json
{
    "info":false,
    "err":"Odottamaton virhe tapahtui pelaajien lisäyksessä"
}
```

### nextRound(usersObj)
    Funktio aloittaa uuden kierroksen. Ottaa vastaan molemmat pelaaja-oliot listassa.
    Palauttaa json-muodossa vastauksen.

Onnistuneessa tilanteessa:
```json
{
    "info":true
}
```

Jos jokin meni pieleen:
```json
{
    "info":false,
    "err":"*statusCheck funktiosta saatu viesti*"
}
```

Jos ohjelma hajosi virheeseen:
```json
{
    "err":"Odottamaton virhe tapahtui uuden kierokksen aloituksessa"
}
```

### statusCheck(result)
    Funktio tarkistaa palvelimelta saadun vastauksen, jos se sisältää `status` parametrin.
    Jos parametri löytyy tarkistaa mikä statuskoodi sielä on. 
    Ottaa vastaan result (json) parametrin ja palauttaa json-muodossa vastauksen.
    HUOM! Vastauksen `info` parametri on vähän hämäävä. Se kertoo vain, että voiko ohjelma jatkaa toimintaa.
    Eli jos statuskoodi on 401, tokeni on ollut väärä tai sitä ei ole tullut palvelimelle, jolloin pelaaja 
    täytyy heittää ulos sivulta => "info:false".

Jos statuskoodi on 401:
```json
{
    "info":false,
    "details":"Token check fail"
}
```

Jos statuskoodi on 400:
```json
{
    "info":false,
    "details":"*result-parametrista löytyvä err-parametri*"
}
```

Jos statuskoodi on 409:
```json
{
    "info":true,
    "details":"Pelaaja oli jo luultavasti tietokannassa"
}
```

Jos statuskoodi on ohjelmalle tuntematon:
```json
{
    "info":true,
    "details":"Ohjelmistolle tuntematon statuskoodi ('*statuskoodi*')"
}
```

Jos parametri `result` ei sisällä statuskoodia:
```json
{
    "info":true,
    "details":"Status-parametria ei löytynyt"
}
```

### drawBG(ctxBG, imgs)
    Piirtää canvakselle taustakuvan. Ottaa parametreiksi ctxBG (canvaksen konteksti), imgs (kuvat/kuva).
    ctxBG täytyy olla sen canvaksen konteksti, jonne ei piirretä pelaajia. Parametri `imgs` on lista kuvien tai
    kuvan lähteistä. Esimerkiksi arr[0] => "./esimerkki/reitti/kuva.png".
    Funktio ei palauta mitään.

## character.js
    Luokka, joka luo pelaajan. Luokka ottaa parametreiksi ctx, x, y, userW, userH, color, hp
    eli canvaksen kontekstin (canvas context), x ja y koordinaatit johon pelaaja luodaan canvaksella (integer),
    pelaajan leveys (integer), pelaajan korkeus (integer),
    pelaajan väri (string) (tulee olemaan lopuksi pelaajan kuva(t)(jpeg tai png)) ja pelaajan osumapisteet (integer)

### goLeft(amount)
    Funktio, joka liikuttaa pelaajaa vasemmalle. Parametriksi ottaa liikkumismäärän (integer).

### goRight(amount, botX)
    Funktio, joka liikuttaa pelaajaa oikealle. Parametreiksi ottaa liikkumismäärän (integer) ja
    toisen pelaajan eli botin x-koordinaatin (integer).

### jump(amount, bot)
    Funktio, jonka avulla pelaaja hyppää. Parametreiksi funktio ottaa hypyn korkeuden (integer)
    ja toisen pelaajan eli botin (character-luokka).

### block(state)
    Funktio asettaa pelaajan torjumistilaan. Parametriksi ottaa booleanin.

### blockState()
    Parametriton funktio, joka palauttaa torjumistilan. Palautus on boolean.

### punch(bot, hp)
    Funktio, jonka avulla pelaaja lyö. Parametreiksi ottaa toisen pelaajan (character-luokka) 
    ja toisen pelaajan osumapisteet (hp-luokka)

### kick(bot, hp)
    Funktio, jonka avulla pelaaja potkaisee. Parametreiksi ottaa toisen pelaajan (character-luokka) 
    ja toisen pelaajan osumapisteet (hp-luokka)

### awardPoints()
    Parametriton funktio, joka antaa pelaajalle pisteitä.

### getPoints()
    Parametriton funktio, joka palauttaa pelaajan pisteet (integer).

### getCoords()
    Parametriton funktio, joka palauttaa pelaajan koordinaatit, leveyden ja korkeuden canvaksella.
    Palauttaa json-muodossa (arvot ovat integereitä):
```json
{
    "x":"this.x", 
    "y":"this.y", 
    "w":"this.userW", 
    "h":"this.userH"
}
```

### piirraChar()
    Parametriton funktio, joka piirtää pelaajan canvakselle.

### piirraCanvas()
    Parametriton funktio, joka luo canvaksen.

### getHP()
    Parametriton funktio, joka palauttaa pelaajan osumapisteet (integer).

### getAttackStatus()
    Parametriton funktio, joka kertoo voiko pelaaja hyökätä. Palauttaa booleanin.

### getName()
    Parametriton funktio, joka palauttaa pelaaja-olion nimen (string).

### reset()
    Parametriton funktio, joka palauttaa pelaajan kierroksen aloitusarvoihin.
    Eli pelaajan koorditaatit, leveys ja korkeus palautuu kierroksen alkutilaan.


## charHP.js
    Luokka, joka käsittelee osumapisteiden vaihtelut ja niiden piirtämisen canvakselle.
    Parametreiksi ottaa ctx, player, bot eli canvaksen kontekstin, pelaajan (character-luokka) ja
    toisen pelaajan eli botin (character-luokka)
    Konstruktorissa on myös arvot 'this.botStart' ja 'this.playerStart'. Ne määrittelevät osumapisteiden esittävän
    laatikon piirtokohdan aloituspaikan.
    Konstruktorin ulkopuolella on muuttujat 'hpWidth' esittää osumapisteiden esittävän laatikon leveyden,
    'botRedBlock' ja 'playerRedBlock' esittää osumapistelaatikossa otetun osuman määrän.

### drawBarL(name)
    Funktio luo osumapistelaatikon canvaksen vasemmalle puolelle. Parametriksi ottaa nimen (string).

### drawBarR(name)
    Funktio luo osumapistelaatikon canvaksen oikealle puolelle. Parametrikis ottaa nimen (string).

### drawDMG(amount, who)
    Funktio piirtää otetun osuman osumapistelaatikkoon. Parametreiksi ottaa osuman vahingon kertoimen (integer) 
    ja kenelle vahinko tehdään (string)

### takeHit(amount, who)
    Funktio käsittelee osumat ja pysäyttää pelin, jos jommankumman pelaajan osumapisteet on 0.
    Parametreiksi ottaa osuman vahingon määrän (integer) ja kenelle vahinko tehdään (string)

### returnHP()
    Parametriton funktio, joka palauttaa molempien pelaajien osumapisteet.
    Palautus on json-muodossa (arvot ovat integereitä): 
```json
{
    "botHP":"this.botHP",
    "playerHP":"this.playerHP"
}
```

### reset()
    Parametriton funktio, joka palauttaa kutsuu tarvittavat funktiot pelin uudelleen aloittamiseen.


## canvasMovement.js
    Käsittelee pelaajan tekemät liikkeet.

### suoritaToiminto(player, bot, toiminto, hp)
    Suorittaa pelaajan halutun toiminnon. Parametreiksi ottaa pelaajan (character-luokka),
    toisen pelaajan (character-luokka), toiminnon (string) ja osumapisteluokan (hp-luokka)


## gameServer.js
    Serveri, joka käsittelee käyttäjän tekemät liikkeet ja vahvistaa niiden aitouden.
    Jokainen kutsu ottaa vastaan pelaajan tokenin. Jos se ei täsmää tietokannassa olevaan
    tokeniin, ei kutsu mene läpi ja palautetaan:
```json
{
    "status":401
}
    
```

### POST /player
    Ottaa vastaan tokenin (string), pelaajan character-luokan x, y, w, h koordinaatit, osumapisteet (integer)
    ja pelaajan nimen (string) joka säilötään tietokantaan.
    Jos tietokannassa on jo 2 pelaajaa, ei voida lisätä lisää pelaajia. Jos jokin parametri puuttuu,
    ei lisäys onnistu. Jos molemmilla pelaajilla on sama nimi, vaihdetaan jälkimmäisen lisäyksen nimen perään `_2`.
    Palauttaa json-muodossa booleanin ja username (string), joka sisältää lisätyn käyttäjän nimen.

    Onnistuneessa lisäyksessä palauttaa json-muodossa:
```json
{
    "info":true,
    "username":"pelaaja1"
}
```
    Epäonnistuneessa lisäyksessä palauttaa json-muodossa:
```json
{
    "info":false,
    "username":"pelaaja1"
}
```
    Oletetaan, että palvelimelle on lisätty jo pelaaja nimellä `pelaaja1`.
    Tässä tilanteessa, jos toista saman nimistä pelaajaa yritetään lisätä palauttaa:
```json
{
    "info":true,
    "username":"pelaaja1_2"
}
```
    Jos pelaajia on jo 2 palvelimella palauttaa:
```json
{
    "info":false,
    "status":409
}
```

    Jos tokeni puuttuu tai on väärä palauttaa:
```json
{
    "status":401
}
```

### POST /move
    Tarkistaa halutun liikkumisen vasemmalle tai oikealle. Bodyn mukana tulee tokeni (string), pelaajan koordinaatit (json),
    nimi (string), osumapisteet (integer) ja blockstate (boolean). Jos jokin parametreistä puuttuu, ei kutsu onnistu.
    Poikkeuksena on, että botin tiedoissa ei saa olla token-parametria.
    Blockstate täytyy olla `false`, jotta kutsu menee läpi.
    Palauttaa json-muodossa booleanin.

    Bodyn mukana tulevan datan muoto (oikea pelaaja):
```json
    {
        "username":"pelaaja1",
        "token":"randtoken123",
        "x":100,
        "y":100,
        "w":20,
        "h":20,
        "hp":100,
        "blockstate":false
    }
```
    Bodyn mukana tulevan datan muoto (botti)
```json
    {
        "username":"bot",
        "x":100,
        "y":100,
        "w":20,
        "h":20,
        "hp":100,
        "blockstate":false
    }
```

    Jos liike on sallittu palauttaa:
```json
{
    "info":true
}
```
    Blockstate on `true` palauttaa:
```json
{
    "info":false
}
```
    Jos jokin pelaaja-olioiden parametreista puuttuu palauttaa:
```json
{
    "status":400,
    "info":"pelaajan jokin tieto puuttuu"
}
```
    Jos pelaaja-olion nimi-parametri puuttuu palauttaa:
```json
{
    "status":400,
    "info":"pelaajan nimi puuttuu"
}
```
    Jos pelaaja-olio on vääränlainen palauttaa:
```json
{
    "status":400,
    "info":"pelaajan data on virheellistä"
}
```
    Jos tokeni on väärä tai puuttuu palauttaa:
```json
{
    "state":401
}
```

### POST /attack
    Tarkistaa pelaajan tekemän lyönnin aitouden. Bodyn mukana tulee tokeni (string), nimi (string), 
    blockstate (boolean), osumapisteet (integer) ja koordinaatit (json). Poikkeuksena botilla ei saa olla token-parametria.
    Jos pelaajaa ei löydy tulkitaan se virheelliseksi kutsuksi. Blockstate täytyy olla `false`, jotta kutsu menee läpi
    Palauttaa json-muodossa booleanin.

    Bodyn mukana tulevan datan muoto (oikea pelaaja):
```json
    {
        "username":"pelaaja1",
        "token":"randtoken123",
        "x":100,
        "y":100,
        "w":20,
        "h":20,
        "hp":100,
        "blockstate":false
    }
```
    Bodyn mukana tulevan datan muoto (botti)
```json
    {
        "username":"bot",
        "x":100,
        "y":100,
        "w":20,
        "h":20,
        "hp":100,
        "blockstate":false
    }
```

    Jos liike on sallittu palauttaa:
```json
{
    "info":true,
    "damage":false
}
```
    Jos liike on sallittu ja vastustaja on lyöntietäisyydellä palauttaa:
```json
{
    "info":true,
    "damage":true
}
```
    Jos liike ei ole sallittu palauttaa:
```json
{
    "info":false
}
```
    Blockstate on `true` palauttaa:
```json
{
    "info":false
}
```
    Jos pelaajaa ei löydy palvelimelta palauttaa:
```json
{
    "status":400,
    "info":"Käyttäjää ei löydy"
}
```
    Jos jokin pelaaja-olion parametri puuttuu palauttaa:
```json
{
    "status":400,
    "info":"Jokin pelaajan tieto puuttuu"
}
```
    Jos tokeni on väärä tai puuttuu palauttaa:
```json
{
    "state":401
}
```

### POST /game
    Pitää huolen siitä, että palvelin tietää milloin peli on alkanut ja milloin se loppuu.
    Ottaa vastaan pelaajan tokenin (string), pelaajan nimen (string), HTML canvas-elementin leveyden (integer), 
    pelin alkaessa booleanin `true` ja pelin loppuessa `false`.
    Jos canvas-elementin pituus puuttuu
    Palauttaa json-muodossa vastauksen.

    Jos jotkin parametrit puuttuvat palauttaa:
```json
{
    "err":"Tiedot puutteelliset"
}
```

    Onnistuneessa tilanteessa palauttaa:
```json
{
    "info":true
}
```

    Virhetilanteessa palauttaa:
```json
{
    "err":"Ohjelmassa tapahtui virhe"
}
```
    tai jonkin Database-luokan funktion search virheilmoituksen.

    Jos tokeni on väärä tai puuttuu palauttaa:
```json
{
    "status":401
}
```

    Jos canvas-elementin pituus puuttuu tai se on liian pieni palauttaa:
```json
{
    "status":400
}
```

### POST /delete
    Kutsuttessa poistaa käyttäjän pelaajan tietokannasta ja palvelimen muistista.
    Palauttaa JSON-muodossa vastauksen.
    Bodyn mukana pitää olla käyttäjänimi `username` (string) ja token (string).

    Jos poisto onnistui palauttaa
```json
{
    "info":true
}
```

    Jos poisto epäonnistui palauttaa
```json
{
    "info":false
}
```

    Virhetilanteessa palauttaa
```json
{
    "err":"Pelaajan poistamisessa tapahtui virhe"
}
```

    Jos käyttäjänimi puuttuu palauttaa
```json
{
    "err":"Puuttelliset tiedot"
}
```

    Jos tokeni puuttuu tai on väärä palauttaa
```json
{
    "status":401
}
```

### POST /continue
    Reitti valmistaa pelin jatkamisen yhden kierroksen jälkeen. Jos käyttäjä on hävinnyt aloittaa uuden pelin, mutta
    jos botti on hävinnyt aloittaa uuden kierroksen.
    Ottaa vastaan tokenin, molempien käyttäjän ja botin pelaaja-oliot. Lisäksi botille voi määritellä lisätiedon mukana
    enemmän osumapisteitä.
    Jos pelaaja-oliot tai tokeni puuttuu ei kutsu mene läpi(HUOM! botin pelaaja-olio ei sisällä tokenia).
    Lisätiedot eivät ole pakollisia.
    Reitti antaa vastauksen json-muodossa.

Oletetaan, että kutsun mukana tulee seuraavat tiedot:
```json
[
    {
        "username":"123",
        "token":"9t1w5mwodrez378yun7evg",
        "x":90,
        "y":50,
        "w":120,
        "h":80,
        "hp":100,
        "blockstate":false
    },
    {
        "username":"bot",
        "x":90,
        "y":50,
        "w":120,
        "h":80,
        "hp":0,
        "blockstate":false,
        "newHP":120
    }
]
```

Jos kutsu menee läpi palauttaa:
```json
{
    "info":true,
    "details":[
        {
            "username":"123",
            "token":"9t1w5mwodrez378yun7evg",
            "x":90,
            "y":50,
            "w":120,
            "h":80,
            "hp":100,
            "blockstate":false
        },
        {
            "username":"bot",
            "x":90,
            "y":50,
            "w":120,
            "h":80,
            "hp":120,
            "blockstate":false
        }
    ]
}
```

Jos pelaaja-olioiden parametrit eivät täsmää palvelimella olevien olioiden kanssa:
```json
{
    "info":false,
    "status":400,
    "err":"Oliot eivät täsmää"
}
```

Jos jokin pelaaja-olion parametri puuttuu tai on väärässä muodossa:
```json
{
    "info":false,
    "status":400,
    "err":"Jokin parametri puuttui tai oli virheellinen"
}
```

Jos jommankumman pelaaja-olion username-parametri puuttuu:
```json
{
    "info":false,
    "status":400,
    "err":"Username-parametri puuttuu toiselta pelaajalta tai on virheellinen"
}
```

Jos tietokannan kanssa tapahtui virhe:
```json
{
    "info":false,
    "err":"*tietokannan tarjoama virheilmoitus*"
}
```

Jos token on väärä tai puuttuu:
```json
{
    "status":401
}
```