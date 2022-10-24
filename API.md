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
    pelaajan leveyden (integer) ja pelaajan pituuden (integer).
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

### delete(username, table)
    Funktio poistaa tietokannasta tietoja.
    Parametreiksi ottaa username (string) käyttäjänimi ja table (string) taulukon josta tieto
    halutaan poistaa.
    Jos `table` parametria ei ole määritelty Funktio palauttaa onnistuneessa tilanteessa 
    JSON-muodossa tiedon, että mistä tietoa on yritetty poistaa ja onko jotain poistettu (boolean).
    Jos `table` on määritelty palauttaa funktio JSON-muodossa onnistuiko poistaminen vai ei.
    Parametri `username` on pakollinen, mutta `table` voi jättää tyhjäksi, jolloin kaikista taulukoista
    poistetaan `username` parametriin yhteensopivat osumat.

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
    Ottaa vastaan tokenin (string), pelaajan character-luokan x, y, w, h koordinaatit
    ja pelaajan nimen (string) joka säilötään tietokantaan.
    Jos tietokannassa on jo 2 pelaajaa, ei voida lisätä lisää pelaajia. Jos jokin parametri puuttuu,
    ei lisäys onnistu. Pelaajilla ei voi olla samanimi.

    Onnistuneessa lisäyksessä palauttaa json-muodossa:
```json
{
    "info":true
}
```
    Epäonnistuneessa lisäyksessä palauttaa json-muodossa:
```json
{
    "info":false
}
```

    Jos tokeni puuttuu tai on väärä palauttaa:
```json
{
    "state":401
}
```

### POST /move
    Tarkistaa halutun liikkumisen vasemmalle tai oikealle. Bodyn mukana tulee tokeni (string), pelaajan koordinaatit (json),
    nimi (string), tokeni (string) ja blockstate (boolean). Jos jokin parametreistä puuttuu, ei kutsu onnistu. 
    Palauttaa json-muodossa booleanin.

    Jos liike on sallittu palauttaa:
```json
{
    "info":true
}
```
    Jos liike ei ole sallittu palauttaa:
```json
{
    "info":false
}
```

    Jos tokeni on väärä tai puuttuu palauttaa:
```json
{
    "state":401
}
```

### POST /attack
    Tarkistaa pelaajan tekemän lyönnin aitouden. Bodyn mukana tulee tokeni (string), nimi (string) ja
    molempien pelaajien blockstate (boolean).
    Jos jokin parametri puuttuu, ei kutsu onnistu.
    Palauttaa json-muodossa booleanin.

    Jos liike on sallittu palauttaa:
```json
{
    "info":true
}
```
    Jos liike ei ole sallittu palauttaa:
```json
{
    "info":false
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
    Ottaa vastaan pelaajan tokenin, pelaajan nimen, pelin alkaessa booleanin `true` ja pelin loppuessa `false`.
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