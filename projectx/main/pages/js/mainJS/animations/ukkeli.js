'use strict';

class Ukkeli{
    constructor(kuvat, x=0, y=0){
        super(x,y,kuvat.ALAS[0].leveys, kuvat.ALAS[0].korkeus);
        this.kuvat=kuvat;
        this.aktiivisetKuvat=kuvat.ALAS;
        this.kuvanro=0;
        this.rivinro=0;
    }

    piirra(konteksti){
        let pala = this.aktiivisetKuvat[this.kuvanro];
        this.kuvanro=++this.kuvanro%this.aktiivisetKuvat.length;
        konteksti.drawImage(this.kuvat.kuva,
            //spritestä otettava pala
            pala.x,pala.y, pala.leveys,pala.korkeus,
            //mihin kohtaan piirretään kanvakselle
            this.x,this.y, pala.leveys,pala.korkeus);
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

}