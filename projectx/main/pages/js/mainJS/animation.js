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

// let piirtoalusta;
// let konteksti;
// let ukkeli;
// let ladatutKuvatLkm = 0;

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

class Animations{ // write API
    constructor(canvas, ctx, player, bot, loadedImgsCount){
        this.piirtoalusta = canvas;
        this.konteksti = ctx;
        this.player = player;
        this.bot = bot;
        this.ladatutKuvatLkm = loadedImgsCount;

        this.playerUkkeli;
        this.botUkkeli;
        this.alusta();
    }

    alusta(){
        kuvat.kuva = new Image();
        kuvat.kuva.src = kuvat.nimi;
        kuvat.kuva.onload = this.kuvatLadattu;
    }

    kuvatLadattu(){
        if (++ladatutKuvatLkm === 1) this.lisaaKasittelijat();
    }

    lisaaKasittelijat(){
        const playerCRDS = this.player.getCoords();
        this.playerUkkeli = new Ukkeli(kuvat, playerCRDS.x, playerCRDS.y);
        this.piirra();
    }

    piirra() {
        this.konteksti.clearRect(0, 0, this.piirtoalusta.width, this.piirtoalusta.height);
        this.playerUkkeli.piirra(konteksti);
    }
}

// function alusta() {
//     piirtoalusta = $("#canvas");
//     konteksti = piirtoalusta.getContext("2d"); // jos ei toimi koita ilman jquerya
//     kuvat.kuva = new Image();
//     kuvat.kuva.src = kuvat.nimi;
//     kuvat.kuva.onload = kuvatLadattu;
// }

// function kuvatLadattu() {
//     if (++ladatutKuvatLkm === 1) lisaaKasittelijat();
// }

// function lisaaKasittelijat() {
//     ukkeli = new Ukkeli(kuvat, 40, 40);
//     piirra();
// }

// function suoritaToiminto(toiminto) {
//     switch (toiminto) {
//         case TOIMINTO.ALAS:
//             if (tuliTormays(ukkeli.getTormaysLaatikko(0, 10))) return;
//             ukkeli.siirryAlas(10);
//             break;
//         case TOIMINTO.YLOS:
//             if (tuliTormays(ukkeli.getTormaysLaatikko(0, -10))) return;
//             ukkeli.siirryYlos(10);
//             break;
//         case TOIMINTO.VASEN:
//             if (tuliTormays(ukkeli.getTormaysLaatikko(-10))) return;
//             ukkeli.siirryVasen(10);
//             break;
//         case TOIMINTO.OIKEA:
//             if (tuliTormays(ukkeli.getTormaysLaatikko(10))) return;
//             ukkeli.siirryOikea(10);
//             break;
//     }
//     piirra();
// }