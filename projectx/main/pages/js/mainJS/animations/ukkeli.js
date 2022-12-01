'use strict';

class Ukkeli{
    constructor(ctx, kuvat, x=0, y=0){
        this.konteksti = ctx;
        this.x = x;
        this.y = y;
        this.kuvat=kuvat;
        this.aktiivisetKuvat= this.kuvat.ALAS;
        this.kuvanro=0;
        this.rivinro=0;
        this.currImg = this.kuvat.DEFAULT[0];
    }

    async drawStill(isBot, x=this.x, y=this.y){
        const promiseDraw = new Promise(resolve=>{ // ei luultavasti mitään hyötyy olla promisessa
            let pala = this.kuvat.DEFAULT[0];
            this.konteksti.clearRect(x, y, this.currImg.leveys, this.currImg.korkeus);
            if(isBot) this.konteksti.filter = "invert(1)";
            this.konteksti.drawImage(this.kuvat.kuva,
                //spritestä otettava pala
                pala.x,pala.y, pala.leveys,pala.korkeus,
                //mihin kohtaan piirretään kanvakselle
                x,y, pala.leveys,pala.korkeus);
            this.konteksti.filter = "invert(0)";
            resolve();
        });
        await promiseDraw;
    }

    async piirra(isBot, x=this.x, y=this.y){
        const promiseDraw = new Promise(resolve=>{
            setTimeout(()=>{
                let pala = this.aktiivisetKuvat[this.kuvanro];
                this.kuvanro=++this.kuvanro%this.aktiivisetKuvat.length;
                this.konteksti.clearRect(x, y, this.currImg.leveys, this.currImg.korkeus);
                if(isBot) this.konteksti.filter = "invert(1)";

                this.konteksti.drawImage(this.kuvat.kuva,
                    //spritestä otettava pala
                    pala.x,pala.y, pala.leveys,pala.korkeus,
                    //mihin kohtaan piirretään kanvakselle
                    x,y, pala.leveys,pala.korkeus);
                this.konteksti.filter = "invert(0)";
                this.currImg = pala;
                resolve();    
            }, 60);
        });
        await promiseDraw;
    }

    getActiveImgs(){
        return this.aktiivisetKuvat;
    }

    getCurrentImg(){
        return this.currImg;
    }

    siirryAlas(dy){
        if (this.rivinro != 0) {
            this.kuvanro = 0;
            this.rivinro = 0;
        }
        this.y+=Math.abs(dy);
        this.aktiivisetKuvat=this.kuvat.ALAS;
    }

    siirryYlos(dy) {
        if(this.rivinro!=1) {
            this.kuvanro = 0;
            this.rivinro = 1;
        }
        this.y -= Math.abs(dy);
        this.aktiivisetKuvat = this.kuvat.YLOS;
    }

    siirryVasen(dx) {
        if (this.rivinro != 2) {
            this.kuvanro = 0;
            this.rivinro = 2;
        }
        this.x -= Math.abs(dx);
        this.aktiivisetKuvat = this.kuvat.VASEN;
    }

    siirryOikea(dx) {
        if (this.rivinro != 3) {
            this.kuvanro = 0;
            this.rivinro = 3;
        }
        this.x += Math.abs(dx);
        this.aktiivisetKuvat = this.kuvat.OIKEA;
    }

    siirryPotku(){
        if(this.rivinro != 4){
            this.kuvanro = 0;
            this.rivinro = 4;
        }
        this.aktiivisetKuvat = this.kuvat.POTKU;
    }
}