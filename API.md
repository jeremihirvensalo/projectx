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

## Database

    Luokka joka sisältää tietokantaan liittyvät funktiot.

```js
new Database();
```

Luo `Database` luokan


### insert(username, password)

    Kirjoittaa tietokantaan dataa. 
    Parametreiksi funktio ottaa käyttäjätunnuksen ja
    salasanan.
    Funktioon ei pitäisi olla mahdollista laittaa väärää dataa, 
    koska ne tarkistetaan ennen funktion käyttöä.
    Funktio palauttaa onnistuneessa ja virhetilanteessa
    dataa json muodossa.

```js
const db = new Database();
db.insert("taulu1", "pelaaja1", "salasana1");
```

palauttaa 

```json
{
    "info":"Käyttäjän luonti onnistui"
}
```

Jos käyttäjätunnuksella on jo käyttäjä
palauttaa

```json
{
    "info":"Käyttäjä on jo olemassa"
}
```

Jos jokin menee pieleen kuten, että tietokanta ei
ole päällä:

palauttaa

```json
{
    "err":"Käyttäjän luonti epäonnistui"
}
```


### insertPoints(username, points)

    Kirjoittaa käyttäjän ennätyksen tietokantaan.
    Tietokantaan tallentuu käyttäjätunnus ja piste-ennätys.
    Jos ennätys on jo olemassa sen päälle kirjoitetaan uusi ennätys.

```js
const db = new Database();
db.insertPoints("pelaaja1", 1200);
```

palauttaa

```json
{
    "info":"Tallennus onnistui"
}
```

Mahdollisessa virhetilanteessa kuten, että tietokanta 
ei ole päällä

palauttaa

```json
{
    "err":"Tallennus epäonnistui"
}
```


### searchUser(username)

    Etsii tietokannasta käyttäjän tiedot.
    Funktio palauttaa json-muodossa käyttäjätunnuksen, salasanan ja 
    mahdollisen piste-ennätyksen.

Pelaajalla on ennätys tietokannassa.

```js
const db = new Database();
db.searchUser("pelaaja1");
```

palauttaa
(Salasana on "suolattu")

```json
{
    "username":"pelaaja1",
    "password":"salasana1",
    "points":1200
}
```

Jos käyttäjällä ei ole piste-ennätystä
palauttaa

```json
{
    "username":"pelaaja1",
    "password":"salasana1"
}
```

Jos käyttäjää ei löydy
palauttaa

```json
{
    "info":"Käyttäjää ei löydy"
}
```

Virhetilanteessa
palauttaa

```json
{
    "err":"Virhe käyttäjän haussa tietokannasta"
}
```


### updatePoints(username, points)

    Päivittää käyttäjän mahdollisen piste-ennätyksen.
    Parametreiksi funktio ottaa käyttäjätunnuksen ja pistemäärän.
palauttaa onnistuneessa tilanteessa

```js
const db = new Database();
db.update("pelaaja1", 1200);
```

palauttaa

```json
{
    "info":"Tallennus onnistui"
}
```

Mahdollisessa virhetilanteessa kuten, että tietokanta
ei ole päällä.
palauttaa

```json
{
    "info":"Tallennus epäonnistui"
}
```

Jos koodissa on virhe
palauttaa

```json
{
    "err":"Virhe pisteiden tallennuksessa"
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

### insertToken(username, tkn)
    Syöttää käyttäjän nimen ja tokenin tietokantaan.
    Otta parametreiksi nimen ja tokenin.

```js
insertToken("pelaaja1", "token");
```

Onnistuneessa tallennuksessa palautuu
```json
{
    "info":"Tokenin tallennus onnistui"
}
```

Epäonnistuneessa tilanteessa palautuu
```json
{
    "err":"Tokenin tallennus epäonnistui"
}
```

Virhetilanteessa palautuu
```json
{
    "err":"Virhe tokenin tallennuksessa"
}
```


### searchToken(username)
    Etsii tietokannasta käyttäjän nimen ja tokenin. Ottaa parametriksi nimen.

Onnistuneessa tilanteessa palauttaa käyttäjänimen ja tokenin
```json
{
    "username":"pelaaja1",
    "token":"token"
}
```

Jos tietoja ei löydy palauttaa
```json
{
    "err":"Käyttäjälle ei löytynyt tokenia"
}
```

Virhetilanteessa palautuu
```json
{
    "err":"Virhe tokenin haussa"
}
```

### compareTokens(userToken, dbToken)
    Vertailee tietokannasta saatua tokenia käyttäjän tokeniin
    Palauttaa vertailun onnistuessa `true` ja sen epäonnistuessa `false`


### deleteToken(username)
    Poistaa tokenin tietokannasta. Ottaa parametriksi nimen.

Onnistuneessa tilanteessa palauttaa
username kohdalla on poistetun käyttäjän nimi.
```json
{
    "info":"Käyttäjän username tokeni poistettu"
}
```

Jos käyttäjää ei poistettu palauttaa
```json
{
    "err":"Jokin meni pieleen, eikä käyttäjää poistettu"
};
```

Jos tokenia ei ylipäätään ole palauttaa
```json
{
    "err":"Tokenia ei löytynyt"
}
```

Virhetilanteessa palauttaa
```json
{
    "err":"Virhe tokenin poistossa"
}
```


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
    Käsittelee käyttäjän tekemät liikkeet ja vahvistaa niiden aitouden.