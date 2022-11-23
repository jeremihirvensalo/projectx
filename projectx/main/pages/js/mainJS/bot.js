// Tää on bonari botti joka ei 100% oo vaa pelaaja - score ja pari outoo global variablee, (tee random ja lisää canvaksee)
class Bot extends Character{

    // constructor(ctx, x, y, userW, userH, color, hp, name){
    //     this.ctx = ctx;
    //     this.x = x;
    //     this.y = y;
    //     this.userW = userW;
    //     this.userH = userH;
    //     this.color = color;
    //     this.hp = hp;
    //     this.name = name;
    //     this.startPos = {
    //         x: x,
    //         y: y,
    //         w: userW,
    //         h: userH,
    //         color: color
    //     };
    //     this.piirraChar();

    //     this.blockState = false;
    //     this.canAttack = true;

    // }

    // goLeft(amount){
    //     if((this.x - amount) > 0) this.x -= amount;
    //     this.piirraChar();
    // }
    
    // goRight(amount, botX){
    //     let ogAmount = this.x;
    //     if((this.x + amount) < (800 - this.userW)) this.x += amount; // canvas width: 800
    //     if((this.x) == (botX - this.userW)){
    //         if(ogAmount != this.x) this.x -= amount;
    //     }
    //     this.piirraChar();
    // }

    // jump(amount, bot){
    //     this.y -= amount;
    //     this.piirraChar();
    //     setTimeout(()=>{
    //         this.y += amount;
    //         this.piirraCanvas();
    //         bot.piirraChar();
    //         this.piirraChar();
    //     }, 300);
    // }

    // block(state){
    //     this.blockState = state;
    // }

    // blockState(){
    //     return this.blockState;
    // }

    // punch(bot, hp){
    //     if(!this.canAttack) return;
    //     this.ctx.fillStyle = this.color;
    //     this.ctx.fillRect((this.x + this.userW), (this.y + 40), 70, (this.userH / 3));
    //     this.canAttack = false;
    //     setTimeout(()=>{
    //         this.piirraCanvas();
    //         bot.piirraChar();
    //         this.piirraChar();
    //     }, 100);

    //     if(this.getCoords().x > bot.getCoords().x){
    //         setTimeout(()=>{
    //             this.canAttack = true;
    //         }, 230);
    //         return;
    //     } 
    //     if((bot.getCoords().x - this.x) <= 160){
    //         hp.takeHit(10, bot.getName());
    //     }
    //     setTimeout(()=>{
    //         this.canAttack = true;
    //     }, 230);
    // }
 
    // punchL(bot, hp){
    //     if(!this.canAttack) return;
    //     this.ctx.fillStyle = this.color;
    //     this.ctx.fillRect((this.x - this.userW + 20), (this.y + 40), 70, (this.userH / 3));
    //     this.canAttack = false;
    //     setTimeout(()=>{
    //         this.piirraCanvas();
    //         bot.piirraChar();
    //         this.piirraChar()
    //     }, 100);
    //     if((this.getCoords().x - bot.getCoords().x) <=160 && (this.getCoords().x - bot.getCoords().x) > 0){
    //         hp.takeHit(10, bot.getName());
    //     }
    //     setTimeout(()=>{
    //         this.canAttack = true;
    //     }, 230);
    // }

    // kick(bot, hp){
    //     if(!this.canAttack) return;
    //     this.ctx.fillStyle = this.color;
    //     this.ctx.fillRect((this.x + this.userW), (this.y + 95), 70, (this.userH / 3));
    //     this.canAttack = false;
    //     setTimeout(()=>{
    //         this.piirraCanvas();
    //         bot.piirraChar();
    //         this.piirraChar();
    //     }, 100);

    //     if(this.getCoords().x > bot.getCoords().x){
    //         setTimeout(()=>{
    //             this.canAttack = true;
    //         }, 230);
    //         return;
    //     }
    //     if((bot.getCoords().x - this.x) <= 160){
    //         hp.takeHit(10, bot.getName()); 
    //     }
    //     setTimeout(()=>{
    //         this.canAttack = true;
    //     }, 230);
    // }

    // kickL(bot, hp){
    //     if(!this.canAttack) return;
    //     this.ctx.fillStyle = this.color;
    //     this.ctx.fillRect((this.x - this.userW + 20), (this.y + 95), 70, (this.userH / 3));
    //     this.canAttack = false;
    //     setTimeout(()=>{
    //         this.piirraCanvas();
    //         bot.piirraChar();
    //         this.piirraChar();
    //     }, 100);
    //     if((this.getCoords().x - bot.getCoords().x) <= 160 && (this.getCoords().x - bot.getCoords().x) > 0){
    //         hp.takeHit(10, bot.getName());
    //     }
    //     setTimeout(()=>{
    //         this.canAttack = true;
    //     }, 230);
    // }


    // getCoords(){
    //     return {x:this.x, y:this.y, w:this.userW, h:this.userH};
    // }

    // piirraChar(){
    //     this.ctx.fillStyle = this.color;
    //     this.ctx.fillRect(this.x, this.y, this.userW, this.userH);
    // }

    // piirraCanvas(){
    //     this.ctx.fillStyle = "grey"; // tähän taustakuva
    //     this.ctx.clearRect(0, 170, 800, 400); // vain canvaksen alaosa piirretään uusiksi
    //     this.ctx.fillRect(0, 170, 800, 400);
    // }

    // getHP(){
    //     return this.hp;
    // }

    // getAttackStatus(){
    //     return this.canAttack;
    // }

    // getName(){
    //     return this.name;
    // }

    // reset(){
    //     this.x = this.startPos.x;
    //     this.y = this.startPos.y;
    //     this.userW = this.startPos.w;
    //     this.userH = this.startPos.h;
    // }
}