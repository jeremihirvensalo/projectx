// Tää on bonari botti joka ei 100% oo vaa pelaaja - score ja pari outoo global variablee, (tee random ja lisää canvaksee)
class Bot extends Character{
    
    doRandomAction(player) {

        let moveAmount = 50;

        let moveActions = [
            ()=>{this.goLeft(moveAmount)},
            ()=>{this.goRight(moveAmount)},
            ()=>{this.jump(50, player)}
        ];

        let attackActions = [
            ()=>{this.punch(player, this.hp)},
            ()=>{this.punchL(player, this.hp)},
            ()=>{this.kick(player, this.hp)},
            ()=>{this.kickL(player, this.hp)}
        ];

        let actions = [
            ()=>{}, // Do nothing,
            ()=>{}, // Do nothing,
            ...moveActions, // Näil on isompi tsäännssi tulla valituks
            ...moveActions,
            ...moveActions,

            ...attackActions

        ];
        let actionIndex = Math.floor(Math.random() * actions.length);
        console.log("action index", actionIndex);
        let action = actions[actionIndex];
        console.log("action", action);
        action();
    }

    // Overloads

    punch(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x + this.userW), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar();
        }, 100);

        if(this.getCoords().x > player.getCoords().x){
            setTimeout(()=>{
                canAttack = true;
            }, 230);
            return;
        } 
        if((player.getCoords().x - this.x) <= 160){
            hp.takeHit(10, player.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }
 
    punchL(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 40), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar()
        }, 100);
        if((this.getCoords().x - player.getCoords().x) <=160 && (this.getCoords().x - player.getCoords().x) > 0){
            hp.takeHit(10, player.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    

    kick(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x + this.userW), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar();
        }, 100);

        if(this.getCoords().x > player.getCoords().x){
            setTimeout(()=>{
                canAttack = true;
            }, 230);
            return;
        }
        if((player.getCoords().x - this.x) <= 160){
            hp.takeHit(10, player.getName()); 
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }

    kickL(player, hp){
        if(!canAttack) return;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect((this.x - this.userW + 20), (this.y + 95), 70, (this.userH / 3));
        canAttack = false;
        setTimeout(()=>{
            this.piirraCanvas();
            player.piirraCharStill();
            this.piirraChar();
        }, 100);
        if((this.getCoords().x - player.getCoords().x) <= 160 && (this.getCoords().x - player.getCoords().x) > 0){
            hp.takeHit(10, player.getName());
        }
        setTimeout(()=>{
            canAttack = true;
        }, 230);
    }
}