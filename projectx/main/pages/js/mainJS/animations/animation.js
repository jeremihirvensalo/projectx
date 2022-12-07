'use strict';

class Animations{
    constructor(canvas, ctx, imgs){
        this.piirtoalusta = canvas;
        this.konteksti = ctx;
        this.player;
        this.playerUkkeli;
        this.kuvat = imgs;
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
        this.playerUkkeli.drawStill(this.player.getName() !== getCookieValue("username"), playerCRDS.x, playerCRDS.y);
    }

    getUkkeli(){
        return this.playerUkkeli;
    }

    getAnimations(){
        return this;
    }
}