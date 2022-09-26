# Project X vaatimusdokumentti

## Kuvaus
    Pelin idea on tapella vastustajia vastaan ja päästä mahdollisimman pitkälle.
    Peli loppuu kun pelaajalla ei ole osumapisteitä jäljellä. 
    Pisteitä saa vihollisen voittamisesta. 
    Peli pyörii 2D canvas-elementillä ja hahmoa kontrolloidaan näppäimistön avulla.
    Peli on yksinpeli.
    Sivu vaatii kirjautumisen. 

## Pelaajan hahmo
    Pelaajan hahmo voi lyödä eteenpäin, lyödä alaspäin, torjua lyönti, hypätä, liikkua oikealle ja vasemmalle.
    Alaspäin lyönnin voi väistää hyppäämällä ja lyönnin eteenpäin voi torjua.
    Vastustajalla ja pelaajalla on 100 osumapistettä ensimmäisellä kierroksella. Jokainen osunut lyönti vie 10 osumapistettä.
    Vastustaja saa jokaisen kierroksen jälkeen 20 osumapistettä lisää eli kierroksella 2, sillä on 120 osumapistettä.
    Jokaisen kierroksen aluksi molemmat saavat täydet osumapisteet.

## Yksinpelimuoto
    Pelissä vastustajana on AI-pelaaja. Kun kierroksen voittaa vastustaja vaihtuu.
    Uudella vastustajalla on enemmän osumapisteitä ja/tai vaikeammat lyöntisarjat.
    Käyttäjä saa myös täydet osumapisteet voitetun kierroksen jälkeen.
    Käyttäjän hävitessä mahdollinen ennätys ja muu kerättävä data tallennetaan tietokantaan.

## Kirjautuminen
    Kun käyttäjä kirjautuu sivulle tallentuu hänen kirjautuminen evästeihin 15 minuutiksi,
    jotta käyttäjän ei tarvitse heti kirjautua uudestaan jos sivu lataa uudestaan.
    Uudet tunnukset voidaan luoda kirjautumis-sivun kautta.
    Kirjautumistiedot tallennetaan tietokantaan ja salasana "suolataan" bcrypt moduulilla.
    Kahdella tilillä ei voi olla samaa nimeä.

## Tietokanta
    Tietokantaan tallennetaan yksittäisen käyttäjän piste-ennätykset,
    käyttäjän nimi ja "suolattu" salasana.
    Nimi ja salasana tallennetaan eri tauluun kuin piste-ennätykset.
    Tallennetut pisteet ovat merkitty tietokannassa sen saavuttaneelle käyttäjälle.
    esim.

    | username | pisteet |
    | -------- | ------- |
    | pelaaja 1|  1000   |
    | pelaaja 2|  930    |

    Tietokannasta haetaan ja kirjoitetaan tietoja REST-palvelimen avulla.