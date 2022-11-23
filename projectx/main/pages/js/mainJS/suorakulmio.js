'use strict';

class Suorakulmio{
    constructor(x,y,leveys,korkeus){
        this.x=x;
        this.y=y;
        this.leveys=leveys;
        this.korkeus=korkeus;

        this.minX=Math.min(x, x+leveys)
        this.maxX=Math.max(x,x+leveys);
        this.minY=Math.min(y,y+korkeus);
        this.maxY=Math.max(y,y+korkeus);
    }

    onTormays(verrattava){
        if(this.maxX <= verrattava.minX) return false;
        if(this.minX >= verrattava.maxX) return false;
        if(this.maxY <= verrattava.minY) return false;
        if(this.minY >= verrattava.maxY) return false;
        return true;
    }
}