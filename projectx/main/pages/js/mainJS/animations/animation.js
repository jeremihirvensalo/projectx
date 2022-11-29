'use strict';

class Animations{ // write API
    constructor(canvas, ctx, loadedImgsCount = 0){
        this.piirtoalusta = canvas;
        this.konteksti = ctx;
        this.player;
        this.playerUkkeli;
        this.ladatutKuvatLkm = loadedImgsCount;
        this.kuvat = {
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
        };
    }

    async alusta(player){
        this.player = player;
        this.kuvat.kuva = await this.promiseImgLoad(this.kuvat.nimi);
        this.lisaaKasittelijat();
    }

    async promiseImgLoad(source){
        let img;
        const promiseImage = new Promise(resolve =>{
            img = new Image();
            img.onload = resolve;
            img.src = source;
        });

        await promiseImage;
        return img;
    }

    lisaaKasittelijat(){
        const playerCRDS = this.player.getCoords();
        this.playerUkkeli = new Ukkeli(this.konteksti, this.kuvat, playerCRDS.x, playerCRDS.y);
        this.playerUkkeli.drawStill();
    }

    getUkkeli(){
        return this.playerUkkeli;
    }

    getAnimations(){
        return this;
    }
}