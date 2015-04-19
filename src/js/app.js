
const TILE_SIZE = 64;
const GROUND_LEVEL = 576;

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload, create, render, update });

function preload() {
    game.load.image("player", "images/player.png");
    game.load.image("bg", "images/bg.png");
    game.load.image("block", "images/block.png");
    game.load.image("enemy", "images/enemy.png");
}


function createMap(width, height) {
    const array = [];

    iterate2d(width, height, (x, y) => {

        const tile = Math.random() > 0.9 ? 1 : 0;

        array.push(tile);

    });

    const entities = [];

    for (let i = 0; i < 100; i++ ) {
        const type = "collectable";
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        entities.push({ type, x, y });
    }

    for (let i = 0; i < 100; i++ ) {
        const type = "enemy";
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        entities.push({ type, x, y });
    }


    return {
        width, height,
        array,
        entities,
        get: (x, y) => array[y * width + x],
        iterate: (f) => iterate2d(width, height, f)
    };
}

function iterate2d(w, h, f) {
    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            f(i, j, j * w + i);
        }
    }
}

var group, player, floor, jumpKey, attackKey, map, mapSprites, entitySprites

function create() {

    map = createMap(200, 10);

    game.stage.backgroundColor = "#3F405F";

    function bg(idx) {
        const spr = new Phaser.Sprite(game, 0, 0, "bg");
        spr.y = game.stage.height - spr.height + idx*50;
        spr.tint = 0x626382;
        spr.alpha = 0.3;
        game.world.addChild(spr);
    }
    bg(0);
    bg(1);
    bg(2);
    bg(3);
    



    group = game.add.group();

    mapSprites = {
        array: new Array(),
        get: function(x, y) {
            return this.array[y * map.width + x];
        }
    };


    map.iterate((x, y, idx) => {

        const tileId = map.array[idx];

        if (tileId == 0) return;

        const sprite = new Phaser.Sprite(game, x * TILE_SIZE, y * TILE_SIZE, "block");
        sprite.tint = 0x37345A;
        group.addChild(sprite);

        mapSprites.array[idx] = sprite;

    });

    const floorBitmap = createBitmap("#37345A", 1, 1)
    floor = new Phaser.Sprite(game, -100, GROUND_LEVEL + 20, floorBitmap);
    floor.rotation = -0.1;
    floor.width = 1000;
    floor.height = 200;
    game.world.addChild(floor);


    entitySprites = new Array(map.entities.length);

    const collectableBitmap = createBitmap("#AFD4A9", 10, 10);

    map.entities.forEach((entityDef, idx) => {
        var entity;

        if (entityDef.type == 'collectable') {
            entity = new Phaser.Sprite(game, 0, 0, collectableBitmap);
            entity.rotation = Math.PI/4;
        }
        else if (entityDef.type == 'enemy') {
            entity = new Phaser.Sprite(game, 0, 0, 'enemy');
            entity.tint = 0xAF5A5A;
        }

        entity.anchor.set(0.5, 0.5);
        entity.x = entityDef.x * TILE_SIZE + (TILE_SIZE - 10) / 2;
        entity.y = entityDef.y * TILE_SIZE + (TILE_SIZE - 10) / 2;
        group.addChild(entity);


        entitySprites[idx] = entity;
    })


    player = new Phaser.Sprite(game, 0, GROUND_LEVEL, "player");
    player.tint = 0xC4A24D;
    player.width = 50;
    player.height = 100;
    player.velocity = new Phaser.Point(0, 0);
    player.isOnGround = true;
    player.groundLevel = GROUND_LEVEL;
    group.addChild(player);

    const glow = createGlowEffect(player)
    moveSiblingToChild(glow, player);
    glow.kill();

    const playerClone = player.cloneSprite()
    moveSiblingToChild(playerClone, player);


    jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    attackKey = game.input.keyboard.addKey(Phaser.Keyboard.A);

    attackKey.onDown.add(() => {
        createGlowEffect(player)
    })


   
}

Object.defineProperty(Phaser.Sprite.prototype, 'scaleXY', {
    get: function() {
        return this.scale.x;
    },
    set: function(v) {
        this.scale.set(v, v);
    }
});

Phaser.Sprite.prototype.cloneSprite = function() {
    const spr = new Phaser.Sprite(this.game, this.x, this.y, this.key);
    spr.width = this.width;
    spr.height = this.height;
    spr.tint = this.tint;
    spr.alpha = this.alpha;
    spr.scaleXY = this.scaleXY;
    spr.anchor.set(this.anchor.x, this.anchor.y);
    spr.rotation = this.rotation;
    this.parent.addChild(spr);
    return spr;
}

function centerSpriteOnSprite(spr1, spr2) {
    spr1.x = spr2.x + (spr2.width - spr1.width) / 2;
    spr1.y = spr2.y + (spr2.height - spr1.height) / 2;
}

function centerSpriteAt(spr, x, y) {
    spr.x = x - spr.width / 2;
    spr.y = y - spr.height / 2;
}

function createPounceEffect(entity, dx, dy, finalScale=2, alpha=0.4) {
    const spr = entity.pounceEffect || entity.cloneSprite();
    spr.alpha = alpha;
    spr.scale.set(1);

    const finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
    const finalY = entity.y + (entity.height - entity.height * finalScale);
    game.add.tween(spr).to({ scaleXY: finalScale, alpha: 0, x: finalX, y: finalY }, 1000, Phaser.Easing.Circular.Out, true)
}

function createPounceEffectSpin(entity, dx, dy, finalScale=2, alpha=0.4) {
    const spr = entity.pounceEffect = entity.pounceEffect || entity.cloneSprite();
    spr.alpha = alpha;
    spr.scale.set(1);
    spr.rotation = 0;

    const finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
    const finalY = entity.y + (entity.height - entity.height * finalScale);
    game.add.tween(spr).to({ 
        scaleXY: finalScale, 
        alpha: 0, 
        x: finalX, 
        y: finalY,
        rotation: 15
    }, 1000, Phaser.Easing.Circular.Out, true)
}

function moveSiblingToChild(sprite, child) {
    if (sprite.parent !== child.parent) throw "Not siblings";
    sprite.parent.removeChild(sprite);
    child.addChild(sprite);
    sprite.x -= child.x;
    sprite.y -= child.y;
}

function createGlowEffect(entity) {
    const spr = entity.glowEffect = entity.glowEffect || entity.cloneSprite();
    spr.revive();
    spr.scaleXY = 3;
    spr.tint = 0xAF5A5A;
    spr.alpha = 0.5;
    centerSpriteAt(spr, entity.width / 2, entity.height / 2)

    game.add.tween(spr).to({ 
        scaleXY: 4, 
        alpha: 0, 
    }, 1000, Phaser.Easing.Circular.Out, true)

    return spr;
}

function update() {

    player.x += 3;
    player.groundLevel += Math.sin(floor.rotation) * 3;
    group.y -= Math.sin(floor.rotation) * 3;
    group.x = -player.x + 100;

    if (!player.isOnGround) {
        if (jumpKey.isDown && player.jumpSpeed > 0) {
            player.velocity.y -= player.jumpSpeed;
        }
        player.velocity.y += 0.4;
        player.jumpSpeed -= 0.05;
        player.airTime ++;
    } else {
        player.airTime = 0;
        player.jumpSpeed = 1;
    }



    if (jumpKey.isDown && player.isOnGround) {
        player.isOnGround = false;
        player.velocity.y = -5;
        createPounceEffect(player, 0, -1);
    }

    


    const prevY = player.y;
    const newY = player.y + player.velocity.y;

    const collision = checkCollisions(map, prevY, newY, player);
    if (collision.isCollision) {
        player.y = collision.y - player.height;
        player.velocity.y = 0;
        player.isOnGround = true;

    } else {
        player.isOnGround = false;
    }

    player.y += player.velocity.y;


    map.entities.forEach((entityDef, idx) => {
        const entity = entitySprites[idx];
        if (entityDef.type == 'collectable') {
            if (entity.x > player.x && entity.x < player.x + player.width && 
                entity.y > player.y && entity.y < player.y + player.height && entity.alive) {
                entity.scaleXY = 2;
                createPounceEffectSpin(entity, 0, 0, 3, 1)
                entity.kill();
            } 
        } else if (entityDef.type == 'enemy') {
            entity.scaleXY = (Math.sin(Date.now() / 100) * 0.5 + 0.5) * 1 + 0.5
        }
    });

    if (player.glowEffect && player.glowEffect.alive) {
        if (Math.floor(Date.now()) % 2 == 0) {
            player.glowEffect.tint = ((1<<24)*Math.random()|0);
        }
        // player.glowEffect.alpha = Math.random();
        // player.glowEffect.scaleXY = (Math.sin(Date.now() / 500) * 0.5 + 0.5) * 1 + 2;
        centerSpriteAt(player.glowEffect, player.width / 2, player.height / 2);
        if (player.glowEffect.alpha == 0) {
            player.glowEffect.kill();
        }
    }


}

function render() {


}


function checkCollisions(map, prevY, newY, entity) {


    function pointToTile(p) {
        return Math.floor(p / TILE_SIZE);
    }
    function tileFromPoint(px, py) {
        const x = pointToTile(px);
        const y = pointToTile(py);
        const tile = map.get(x, y);
        return { x, y, tile };
    }

    if (entity.width > TILE_SIZE) throw "Entity to wide";

    var collision = { isCollision: false, y: 0, entity: null };

    if (prevY > newY) return collision;

    if (newY >= player.groundLevel - entity.height) {

        collision.isCollision = true;
        collision.y = player.groundLevel;
        return collision;
    }

    const flat = prevY == newY;

    const jumpOn = (x) => (flat || !tileFromPoint(x, prevY + entity.height).tile) &&
                          tileFromPoint(x, newY + entity.height).tile;

    
    if (jumpOn(entity.x) || jumpOn(entity.x + entity.width)) {
        const tileX = pointToTile(player.x + player.width / 2);
        const tileY = pointToTile(newY + entity.height);
        collision.isCollision = true;
        collision.tileX = tileX;
        collision.tileY = tileY;
        collision.y = tileY * TILE_SIZE;
        return collision;
    }

    return collision;

}


function createBitmap(colour, width, height) {
    var data = game.add.bitmapData(width, height);

    data.ctx.beginPath();
    data.ctx.rect(0, 0, width, height);
    data.ctx.fillStyle = colour;
    data.ctx.fill();

    return data;
}