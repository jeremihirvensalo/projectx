'use strict';

const movement = {
    ArrowUp: "UP",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    KeyW: "UP",
    KeyA: "LEFT",
    KeyD: "RIGHT",
    Space: "BLOCK",
    KeyF: "PUNCH",
    KeyR: "PUNCHL",
    KeyG: "KICK",
    KeyC: "KICKL"
};

let nappis;
let piirtoalusta;
let konteksti;
let ukkeli;
let ladatutKuvatLkm = 0;

const esteet = [];

let kuvat = {
    nimi: 'abobo.png',
    kuva: null,
    ALAS: [
        { x: 411, y: 1022, leveys: 104, korkeus: 121 },
        { x: 66, y: 1195, leveys: 99, korkeus: 119 },
        { x: 196, y: 1191, leveys: 166, korkeus: 117 },
        { x: 66, y: 1195, leveys: 99, korkeus: 119 },
        { x: 411, y: 1022, leveys: 104, korkeus: 121 }
    ],
    YLOS: [

        { x: 323, y: 365, leveys: 101, korkeus: 114 },
        { x: 444, y: 359, leveys: 97, korkeus: 132 },
        { x: 85, y: 525, leveys: 97, korkeus: 120 },
        { x: 207, y: 520, leveys: 97, korkeus: 94 },
        { x: 85, y: 525, leveys: 97, korkeus: 120 },
        { x: 444, y: 359, leveys: 97, korkeus: 132 },
        { x: 323, y: 365, leveys: 101, korkeus: 114 }


    ],
    VASEN: [
        { x: 74, y: 203, leveys: 98, korkeus: 125 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 442, y: 201, leveys: 96, korkeus: 127 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 }

    ],
    OIKEA: [
        { x: 74, y: 203, leveys: 98, korkeus: 125 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 442, y: 201, leveys: 96, korkeus: 127 },
        { x: 313, y: 201, leveys: 96, korkeus: 129 },
        { x: 184, y: 204, leveys: 99, korkeus: 124 }
    ]
}

function alusta() {
    // nappis = new Nappaimisto();
    // nappis.lisaaNappain(NAPPAIN.NUOLI_ALAS, TOIMINTO.ALAS);
    // nappis.lisaaNappain(NAPPAIN.NUOLI_YLOS, TOIMINTO.YLOS);
    // nappis.lisaaNappain(NAPPAIN.NUOLI_VASEN, TOIMINTO.VASEN);
    // nappis.lisaaNappain(NAPPAIN.NUOLI_OIKEA, TOIMINTO.OIKEA);
    // nappis.lisaaNappain(NAPPAIN.D, TOIMINTO.OIKEA)

    kuvat.kuva = new Image();
    kuvat.kuva.src = kuvat.nimi;
    kuvat.kuva.onload = kuvatLadattu;
}

function kuvatLadattu() {
    if (++ladatutKuvatLkm === 1) lisaaKasittelijat();
}

function lisaaKasittelijat() {
    ukkeli = new Ukkeli(kuvat, 40, 40);
    piirra();
}

function tuliTormays(ukkelilaatikko) {
    for (let este of esteet) {
        if (este.onTormays(ukkelilaatikko)) {
            return true;
        }
    }
    return false;
}
function suoritaToiminto(toiminto) {
    switch (toiminto) {
        case TOIMINTO.ALAS:
            if (tuliTormays(ukkeli.getTormaysLaatikko(0, 10))) return;
            ukkeli.siirryAlas(10);
            break;
        case TOIMINTO.YLOS:
            if (tuliTormays(ukkeli.getTormaysLaatikko(0, -10))) return;
            ukkeli.siirryYlos(10);
            break;
        case TOIMINTO.VASEN:
            if (tuliTormays(ukkeli.getTormaysLaatikko(-10))) return;
            ukkeli.siirryVasen(10);
            break;
        case TOIMINTO.OIKEA:
            if (tuliTormays(ukkeli.getTormaysLaatikko(10))) return;
            ukkeli.siirryOikea(10);
            break;
    }
    piirra();
}

function piirra() {
    konteksti.clearRect(0, 0, piirtoalusta.width, piirtoalusta.height);
    for (let este of esteet) {
        este.piirra(konteksti);
    }
    ukkeli.piirra(konteksti);
}