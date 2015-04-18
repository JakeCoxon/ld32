
const TILE_SIZE = 64;
const GROUND_LEVEL = 576;

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload, create, render, update });

function preload() {
    game.load.image("player", "images/player.png");
    game.load.image("bg", "images/bg.png");
    game.load.image("block", "images/block.png");
}


function createMap(width, height) {
    const array = [];

    iterate2d(width, height, (x, y) => {

        const tile = Math.random() > 0.9 ? 1 : 0;

        array.push(tile);

    });

    const entities = [];

    for (let i = 0; i < 100; i++ ) {
        var x = Math.floor(Math.random() * width);
        var y = Math.floor(Math.random() * height);
        entities.push({ x, y });
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

var group, player, floor, jumpKey, map, mapSprites

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
    


    const createTile = (color) => createBitmap(color, TILE_SIZE, TILE_SIZE);

    const tiles = [
        createTile("#111111"),
        createTile("#37345A")
    ];

    group = game.add.group();

    mapSprites = {
        array: new Array(map.length),
        get: function(x, y) {
            return this.array[y * map.width + x];
        }
    };


    map.iterate((x, y, idx) => {

        const tileId = map.array[idx];
        const tile = tiles[tileId];

        if (tileId == 0) return;

        const sprite = new Phaser.Sprite(game, x * TILE_SIZE, y * TILE_SIZE, "block");
        sprite.tint = 0x37345A;
        group.addChild(sprite);

        mapSprites.array[idx] = sprite;

    });

    floor = new Phaser.Sprite(game, -100, GROUND_LEVEL + 20, tiles[1]);
    floor.rotation = -0.1;
    floor.width = 1000;
    floor.height = 200;
    game.world.addChild(floor);


    const collectableBitmap = createBitmap("#AFD4A9", 10, 10);

    map.entities.forEach(collectable => {
        const entity = new Phaser.Sprite(game, 0, 0, collectableBitmap);
        group.addChild(entity);
        entity.x = collectable.x * TILE_SIZE + (TILE_SIZE + 10) / 2;
        entity.y = collectable.y * TILE_SIZE + (TILE_SIZE + 10) / 2;
    })


    player = new Phaser.Sprite(game, 0, GROUND_LEVEL, "player");
    player.tint = 0xC4A24D;
    player.width = 50;
    player.height = 100;
    player.velocity = new Phaser.Point(0, 0);
    player.isOnGround = true;
    player.groundLevel = GROUND_LEVEL;
    group.addChild(player);


    jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


   
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
    this.parent.addChild(spr);
    return spr;
}

function createPounceEffect(entity, dx, dy) {
    const spr = entity.pounceEffect || entity.cloneSprite();
    spr.alpha = 0.4;
    spr.scale.set(1);

    const finalScale = 2;
    const finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
    const finalY = entity.y + (entity.height - entity.height * finalScale);
    game.add.tween(spr).to({ scaleXY: finalScale, alpha: 0, x: finalX, y: finalY }, 1000, Phaser.Easing.Circular.Out, true)
}

function update() {

    player.x += 3;//Math.sin(group.rotation) * 3;
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