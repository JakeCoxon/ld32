import * as util from './util.js'
import * as effects from './effects.js'
import collision from './collision.js'
import generateLevel from './level-generator.js'

const TILE_SIZE = 64;
const GROUND_LEVEL = 448;
const GROUND_ROTATION = -0.1;
const OFFSET_Y = 50;
const SPEED = 4;

const checkCollisions = collision(TILE_SIZE);


    
const state = {

    preload() {
        game.load.image("player", "images/player.png");
        game.load.image("bg", "images/bg.png");
        game.load.image("block", "images/block.png");
        game.load.image("enemy", "images/enemy.png");
        game.load.image("enemy2", "images/enemy2.png");

        game.load.image("player-d1", "images/player-d1.png");
        game.load.image("player-d2", "images/player-d2.png");
        game.load.image("player-d3", "images/player-d3.png");
        game.load.image("player-d4", "images/player-d4.png");
        game.load.image("player-d5", "images/player-d5.png");
    },

    create() {

        // var group, player, floor, jumpKey, attackKey, map, mapSprites, entitySprites, isDead

        this.isDead = false;

        this.map = generateLevel(200, 8, GROUND_ROTATION);

        game.stage.backgroundColor = "#3F405F";

        function bg(idx) {
            const spr = new Phaser.Sprite(game, 0, 0, "bg");
            spr.y = game.stage.height - spr.height + idx*50;
            spr.tint = 0x626382;
            spr.alpha = 0.3;
            game.world.addChild(spr);
        }
        [0,1,2,3].forEach(bg);


        this.group = game.add.group();
        this.group.y = OFFSET_Y;

        this.mapSprites = new Array(this.map.width);


        this.map.iterate((x, y, idx) => {

            const tileId = this.map.get(x, y);

            if (tileId == 0) return;

            const sprite = new Phaser.Sprite(game, x * TILE_SIZE, y * TILE_SIZE, "block");
            sprite.tint = 0x37345A;
            this.group.addChild(sprite);

            if (!this.mapSprites[x]) {
                this.mapSprites[x] = [];
            }
            this.mapSprites[x][y] = sprite;

        });

        const floorBitmap = util.createBitmap(this.game, "#37345A", 1, 1)
        this.floor = new Phaser.Sprite(this.game, -100, GROUND_LEVEL + 20 + OFFSET_Y, floorBitmap);
        this.floor.rotation = -0.1;
        this.floor.width = 1000;
        this.floor.height = 200;
        this.game.world.addChild(this.floor);


        this.entitySprites = new Array(this.map.entities.length);

        const collectableBitmap = util.createBitmap(this.game, "#AFD4A9", 10, 10);

        this.map.entities.forEach((entityDef, idx) => {
            var entity;

            if (entityDef.type == 'point') {
                entity = new Phaser.Sprite(this.game, 0, 0, collectableBitmap);
                entity.rotation = Math.PI/4;
            }
            else if (entityDef.type == 'enemy') {
                entity = new Phaser.Sprite(this.game, 0, 0, 'enemy');
                entity.tint = 0xAF5A5A;
            }

            entity.anchor.set(0.5, 0.5);
            entity.x = entityDef.x * TILE_SIZE + (TILE_SIZE - 10) / 2;
            entity.y = entityDef.y * TILE_SIZE + (TILE_SIZE - 10) / 2;
            this.group.addChild(entity);


            this.entitySprites[idx] = entity;
        })


        this.player = new Phaser.Sprite(this.game, -800, GROUND_LEVEL - 100, "player");
        this.player.tint = 0xC4A24D;
        this.player.width = 50;
        this.player.height = 100;
        this.player.velocity = new Phaser.Point(0, 0);
        this.player.isOnGround = true;
        this.player.groundLevel = GROUND_LEVEL;
        this.player.score = 0;
        this.player.highScore = (localStorage.getItem('high-score') && Number(localStorage.getItem('high-score'))) || 0;
        updateScore(this.player);
        this.group.addChild(this.player);

        const glow = effects.createGlowEffect(this.player)
        util.moveSiblingToChild(glow, this.player);
        glow.kill();

        const playerClone = this.player.cloneSprite()
        util.moveSiblingToChild(playerClone, this.player);


        this.jumpKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.attackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

        this.attackKey.onDown.add(() => {
            // playerDeath();
            // effects.createGlowEffect(this.player)
        })

        this.jumpKey.onDown.add(() => {
            if (this.isDead) {
                this.game.state.start('gameplay')
            }
        })

       
    },

    playerDeath() {
        this.isDead = true;
        effects.createDeathEffect(this.player);
    },

    update() {

        if (this.isDead) {
            if (!this.group.velocityX) this.group.velocityX = -SPEED;
            const targetX = -this.player.x + 400;
            this.group.x += (targetX - this.group.x) / 50;
            // this.group.velocityX = Math.min(this.group.velocityX + 0.5, 0);

            return;
        }

        this.player.x += SPEED;
        this.player.groundLevel += Math.sin(this.floor.rotation) * SPEED;
        this.group.y -= Math.sin(this.floor.rotation) * SPEED;
        this.group.x = -this.player.x + 100;

        if (!this.player.isOnGround) {
            if (this.jumpKey.isDown && this.player.jumpSpeed > 0) {
                this.player.velocity.y -= this.player.jumpSpeed;
            }
            this.player.velocity.y += 0.4;
            this.player.jumpSpeed -= 0.05;
            this.player.airTime ++;
        } else {
            this.player.airTime = 0;
            this.player.jumpSpeed = 1;
        }



        if (this.jumpKey.isDown && this.player.isOnGround) {
            this.player.isOnGround = false;
            this.player.velocity.y = -5;
            effects.createPounceEffect(this.player, 0, -1);
        }

        


        const prevY = this.player.y;
        const newY = this.player.y + this.player.velocity.y;

        const collision = checkCollisions(this.map, prevY, newY, this.player);
        if (collision.isCollision) {
            this.player.y = collision.y - this.player.height;
            this.player.velocity.y = 0;
            this.player.isOnGround = true;
            if (collision.tileX) {
                const tile = this.mapSprites[collision.tileX] && this.mapSprites[collision.tileX][collision.tileY]
                if (tile) {
                    effects.createJumpEffect(tile);
                }
            }
        } else {
            this.player.isOnGround = false;
        }

        this.player.y += this.player.velocity.y;


        this.map.entities.forEach((entityDef, idx) => {
            const entity = this.entitySprites[idx];
            if (entity.alive) {
                if (entityDef.type == 'point') {
                    if (entity.x > this.player.x && entity.x < this.player.x + this.player.width && 
                        entity.y > this.player.y && entity.y < this.player.y + this.player.height && entity.alive) {
                        entity.scaleXY = 2;
                        effects.createPounceEffectSpin(entity, 0, 0, 3, 1)
                        effects.createGlowEffect(this.player);
                        this.player.score ++;
                        updateScore(this.player);
                        entity.kill();
                    } 
                } else if (entityDef.type == 'enemy') {
                    entity.scaleXY = (Math.sin(Date.now() / 100) * 0.5 + 0.5) * 0.5 + 0.5
                    entity.rotation = (t => {
                        if (Math.sin(t + Math.PI/2) < 0) t += Math.PI
                        return (Math.sin(t) * 0.5 + 0.5) * Math.PI / 2;
                    })(Date.now() / 200);
                    if (entity.x > this.player.x && entity.x < this.player.x + this.player.width && 
                        entity.y > this.player.y && entity.y < this.player.y + this.player.height) {
                        entity.tint = 0xffffff;
                        this.playerDeath();
                    }
                }
            }

        });

        if (this.player.glowEffect && this.player.glowEffect.alive) {
            if (Math.floor(Date.now()) % 2 == 0) {
                this.player.glowEffect.tint = ((1<<24)*Math.random()|0);
            }
            // this.player.glowEffect.alpha = Math.random();
            // this.player.glowEffect.scaleXY = (Math.sin(Date.now() / 500) * 0.5 + 0.5) * 1 + 2;
            util.centerSpriteAt(this.player.glowEffect, this.player.width / 2, this.player.height / 2);
            if (this.player.glowEffect.alpha == 0) {
                this.player.glowEffect.kill();
            }
        }


    },

    render() {


    }

}

function updateScore(entity) {
    entity.highScore = Math.max(entity.highScore, entity.score);
    localStorage.setItem('high-score', entity.highScore);
    document.getElementById('score').innerHTML = entity.score;
    document.getElementById('high-score').innerHTML = entity.highScore;
}

var game = new Phaser.Game(800, 550, Phaser.AUTO, 'content', state);

game.state.add('gameplay', state);



