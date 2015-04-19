/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

	var _import = __webpack_require__(1);

	var util = _interopRequireWildcard(_import);

	var _import2 = __webpack_require__(2);

	var effects = _interopRequireWildcard(_import2);

	var _collision = __webpack_require__(3);

	var _collision2 = _interopRequireWildcard(_collision);

	var _generateLevel = __webpack_require__(4);

	var _generateLevel2 = _interopRequireWildcard(_generateLevel);

	var TILE_SIZE = 64;
	var GROUND_LEVEL = 448;
	var GROUND_ROTATION = -0.1;
	var OFFSET_Y = 50;
	var SPEED = 4;

	var checkCollisions = _collision2['default'](TILE_SIZE);

	var state = {

	    preload: function preload() {
	        game.load.image('player', 'images/player.png');
	        game.load.image('bg', 'images/bg.png');
	        game.load.image('block', 'images/block.png');
	        game.load.image('enemy', 'images/enemy.png');
	        game.load.image('enemy2', 'images/enemy2.png');

	        game.load.image('player-d1', 'images/player-d1.png');
	        game.load.image('player-d2', 'images/player-d2.png');
	        game.load.image('player-d3', 'images/player-d3.png');
	        game.load.image('player-d4', 'images/player-d4.png');
	        game.load.image('player-d5', 'images/player-d5.png');
	    },

	    create: function create() {
	        var _this = this;

	        // var group, player, floor, jumpKey, attackKey, map, mapSprites, entitySprites, isDead

	        this.isDead = false;

	        this.map = _generateLevel2['default'](200, 8, GROUND_ROTATION);

	        game.stage.backgroundColor = '#3F405F';

	        function bg(idx) {
	            var spr = new Phaser.Sprite(game, 0, 0, 'bg');
	            spr.y = game.stage.height - spr.height + idx * 50;
	            spr.tint = 6448002;
	            spr.alpha = 0.3;
	            game.world.addChild(spr);
	        }
	        [0, 1, 2, 3].forEach(bg);

	        this.group = game.add.group();
	        this.group.y = OFFSET_Y;

	        this.mapSprites = new Array(this.map.width);

	        this.map.iterate(function (x, y, idx) {

	            var tileId = _this.map.get(x, y);

	            if (tileId == 0) return;

	            var sprite = new Phaser.Sprite(game, x * TILE_SIZE, y * TILE_SIZE, 'block');
	            sprite.tint = 3617882;
	            _this.group.addChild(sprite);

	            if (!_this.mapSprites[x]) {
	                _this.mapSprites[x] = [];
	            }
	            _this.mapSprites[x][y] = sprite;
	        });

	        var floorBitmap = util.createBitmap(this.game, '#37345A', 1, 1);
	        this.floor = new Phaser.Sprite(this.game, -100, GROUND_LEVEL + 20 + OFFSET_Y, floorBitmap);
	        this.floor.rotation = -0.1;
	        this.floor.width = 1000;
	        this.floor.height = 200;
	        this.game.world.addChild(this.floor);

	        this.entitySprites = new Array(this.map.entities.length);

	        var collectableBitmap = util.createBitmap(this.game, '#AFD4A9', 10, 10);

	        this.map.entities.forEach(function (entityDef, idx) {
	            var entity;

	            if (entityDef.type == 'point') {
	                entity = new Phaser.Sprite(_this.game, 0, 0, collectableBitmap);
	                entity.rotation = Math.PI / 4;
	            } else if (entityDef.type == 'enemy') {
	                entity = new Phaser.Sprite(_this.game, 0, 0, 'enemy');
	                entity.tint = 11491930;
	            }

	            entity.anchor.set(0.5, 0.5);
	            entity.x = entityDef.x * TILE_SIZE + (TILE_SIZE - 10) / 2;
	            entity.y = entityDef.y * TILE_SIZE + (TILE_SIZE - 10) / 2;
	            _this.group.addChild(entity);

	            _this.entitySprites[idx] = entity;
	        });

	        this.player = new Phaser.Sprite(this.game, -800, GROUND_LEVEL - 100, 'player');
	        this.player.tint = 12886605;
	        this.player.width = 50;
	        this.player.height = 100;
	        this.player.velocity = new Phaser.Point(0, 0);
	        this.player.isOnGround = true;
	        this.player.groundLevel = GROUND_LEVEL;
	        this.player.score = 0;
	        this.player.highScore = localStorage.getItem('high-score') && Number(localStorage.getItem('high-score')) || 0;
	        updateScore(this.player);
	        this.group.addChild(this.player);

	        var glow = effects.createGlowEffect(this.player);
	        util.moveSiblingToChild(glow, this.player);
	        glow.kill();

	        var playerClone = this.player.cloneSprite();
	        util.moveSiblingToChild(playerClone, this.player);

	        this.jumpKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	        this.attackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

	        this.attackKey.onDown.add(function () {});

	        this.jumpKey.onDown.add(function () {
	            if (_this.isDead) {
	                _this.game.state.start('gameplay');
	            }
	        });
	    },

	    playerDeath: function playerDeath() {
	        this.isDead = true;
	        effects.createDeathEffect(this.player);
	    },

	    update: function update() {
	        var _this2 = this;

	        if (this.isDead) {
	            if (!this.group.velocityX) this.group.velocityX = -SPEED;
	            var targetX = -this.player.x + 400;
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
	            this.player.airTime++;
	        } else {
	            this.player.airTime = 0;
	            this.player.jumpSpeed = 1;
	        }

	        if (this.jumpKey.isDown && this.player.isOnGround) {
	            this.player.isOnGround = false;
	            this.player.velocity.y = -5;
	            effects.createPounceEffect(this.player, 0, -1);
	        }

	        var prevY = this.player.y;
	        var newY = this.player.y + this.player.velocity.y;

	        var collision = checkCollisions(this.map, prevY, newY, this.player);
	        if (collision.isCollision) {
	            this.player.y = collision.y - this.player.height;
	            this.player.velocity.y = 0;
	            this.player.isOnGround = true;
	            if (collision.tileX) {
	                var tile = this.mapSprites[collision.tileX] && this.mapSprites[collision.tileX][collision.tileY];
	                if (tile) {
	                    effects.createJumpEffect(tile);
	                }
	            }
	        } else {
	            this.player.isOnGround = false;
	        }

	        this.player.y += this.player.velocity.y;

	        this.map.entities.forEach(function (entityDef, idx) {
	            var entity = _this2.entitySprites[idx];
	            if (entity.alive) {
	                if (entityDef.type == 'point') {
	                    if (entity.x > _this2.player.x && entity.x < _this2.player.x + _this2.player.width && entity.y > _this2.player.y && entity.y < _this2.player.y + _this2.player.height && entity.alive) {
	                        entity.scaleXY = 2;
	                        effects.createPounceEffectSpin(entity, 0, 0, 3, 1);
	                        effects.createGlowEffect(_this2.player);
	                        _this2.player.score++;
	                        updateScore(_this2.player);
	                        entity.kill();
	                    }
	                } else if (entityDef.type == 'enemy') {
	                    entity.scaleXY = (Math.sin(Date.now() / 100) * 0.5 + 0.5) * 0.5 + 0.5;
	                    entity.rotation = (function (t) {
	                        if (Math.sin(t + Math.PI / 2) < 0) t += Math.PI;
	                        return (Math.sin(t) * 0.5 + 0.5) * Math.PI / 2;
	                    })(Date.now() / 200);
	                    if (entity.x > _this2.player.x && entity.x < _this2.player.x + _this2.player.width && entity.y > _this2.player.y && entity.y < _this2.player.y + _this2.player.height) {
	                        entity.tint = 16777215;
	                        _this2.playerDeath();
	                    }
	                }
	            }
	        });

	        if (this.player.glowEffect && this.player.glowEffect.alive) {
	            if (Math.floor(Date.now()) % 2 == 0) {
	                this.player.glowEffect.tint = (1 << 24) * Math.random() | 0;
	            }
	            // this.player.glowEffect.alpha = Math.random();
	            // this.player.glowEffect.scaleXY = (Math.sin(Date.now() / 500) * 0.5 + 0.5) * 1 + 2;
	            util.centerSpriteAt(this.player.glowEffect, this.player.width / 2, this.player.height / 2);
	            if (this.player.glowEffect.alpha == 0) {
	                this.player.glowEffect.kill();
	            }
	        }
	    },

	    render: function render() {}

	};

	function updateScore(entity) {
	    entity.highScore = Math.max(entity.highScore, entity.score);
	    localStorage.setItem('high-score', entity.highScore);
	    document.getElementById('score').innerHTML = entity.score;
	    document.getElementById('high-score').innerHTML = entity.highScore;
	}

	var game = new Phaser.Game(800, 550, Phaser.AUTO, 'content', state);

	game.state.add('gameplay', state);

	// playerDeath();
	// effects.createGlowEffect(this.player)

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports.centerSpriteOnSprite = centerSpriteOnSprite;
	exports.centerSpriteAt = centerSpriteAt;
	exports.moveSiblingToChild = moveSiblingToChild;
	exports.createBitmap = createBitmap;
	Object.defineProperty(Object.prototype, 'forEach', {
	    enumerable: false,
	    configurable: false,
	    writable: true,
	    value: function value(f) {
	        var _this = this;

	        Object.keys(this).forEach(function (key) {
	            var value = _this[key];
	            f(value, key);
	        });
	    }
	});

	Object.defineProperty(Phaser.Sprite.prototype, 'scaleXY', {
	    get: function get() {
	        return this.scale.x;
	    },
	    set: function set(v) {
	        this.scale.set(v, v);
	    }
	});

	Phaser.Sprite.prototype.cloneSprite = function () {
	    var spr = new Phaser.Sprite(this.game, this.x, this.y, this.key);
	    spr.width = this.width;
	    spr.height = this.height;
	    spr.tint = this.tint;
	    spr.alpha = this.alpha;
	    spr.scaleXY = this.scaleXY;
	    spr.anchor.set(this.anchor.x, this.anchor.y);
	    spr.rotation = this.rotation;
	    this.parent.addChild(spr);
	    return spr;
	};

	function centerSpriteOnSprite(spr1, spr2) {
	    spr1.x = spr2.x + (spr2.width - spr1.width) / 2;
	    spr1.y = spr2.y + (spr2.height - spr1.height) / 2;
	}

	function centerSpriteAt(spr, x, y) {
	    spr.x = x - spr.width / 2;
	    spr.y = y - spr.height / 2;
	}

	function moveSiblingToChild(sprite, child) {
	    if (sprite.parent !== child.parent) throw 'Not siblings';
	    sprite.parent.removeChild(sprite);
	    child.addChild(sprite);
	    sprite.x -= child.x;
	    sprite.y -= child.y;
	}

	function createBitmap(game, colour, width, height) {
	    var data = game.add.bitmapData(width, height);

	    data.ctx.beginPath();
	    data.ctx.rect(0, 0, width, height);
	    data.ctx.fillStyle = colour;
	    data.ctx.fill();

	    return data;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.createPounceEffect = createPounceEffect;
	exports.createPounceEffectSpin = createPounceEffectSpin;
	exports.createGlowEffect = createGlowEffect;
	exports.createDeathEffect = createDeathEffect;
	exports.createJumpEffect = createJumpEffect;

	var _import = __webpack_require__(1);

	var util = _interopRequireWildcard(_import);

	function createPounceEffect(entity, dx, dy) {
	    var finalScale = arguments[3] === undefined ? 2 : arguments[3];
	    var alpha = arguments[4] === undefined ? 0.4 : arguments[4];

	    var spr = entity.pounceEffect || entity.cloneSprite();
	    spr.alpha = alpha;
	    spr.scale.set(1);

	    var finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
	    var finalY = entity.y + (entity.height - entity.height * finalScale);
	    entity.game.add.tween(spr).to({ scaleXY: finalScale, alpha: 0, x: finalX, y: finalY }, 1000, Phaser.Easing.Circular.Out, true);
	}

	function createPounceEffectSpin(entity, dx, dy) {
	    var finalScale = arguments[3] === undefined ? 2 : arguments[3];
	    var alpha = arguments[4] === undefined ? 0.4 : arguments[4];

	    var spr = entity.pounceEffect = entity.pounceEffect || entity.cloneSprite();
	    spr.alpha = alpha;
	    spr.scale.set(1);
	    spr.rotation = 0;

	    var finalX = entity.x + (entity.width - entity.width * finalScale) / 2;
	    var finalY = entity.y + (entity.height - entity.height * finalScale);
	    entity.game.add.tween(spr).to({
	        scaleXY: finalScale,
	        alpha: 0,
	        x: finalX,
	        y: finalY,
	        rotation: 15
	    }, 1000, Phaser.Easing.Circular.Out, true);
	}

	function createGlowEffect(entity) {
	    var spr = entity.glowEffect = entity.glowEffect || entity.cloneSprite();
	    spr.revive();
	    spr.scaleXY = 1.5;
	    spr.tint = 11491930;
	    spr.alpha = 0.5;
	    util.centerSpriteAt(spr, entity.width / 2, entity.height / 2);

	    entity.game.add.tween(spr).to({
	        scaleXY: 2,
	        alpha: 0 }, 1000, Phaser.Easing.Circular.Out, true);

	    return spr;
	}

	function createDeathEffect(entity) {
	    var deathEffects = entity.deathEffects = entity.deathEffects || (function () {
	        var arr = [];
	        for (var i = 1; i <= 5; i++) {
	            var spr = entity.cloneSprite();
	            spr.loadTexture("player-d" + i);
	            arr.push(spr);
	        }
	        return arr;
	    })();

	    var dir = [[0, -1], [-1, -1], [1, 0], [0, 1], [0, 1.5]];
	    deathEffects.forEach(function (eff, idx) {
	        eff.anchor.set(0.5, 0.5);
	        eff.alpha = 1;
	        eff.scaleXY = 1;
	        eff.x = entity.x + entity.width / 2;
	        eff.y = entity.y + entity.height / 2;

	        entity.game.add.tween(eff).to({
	            scaleXY: 3,
	            alpha: 0.3,
	            x: eff.x + dir[idx][0] * 20,
	            y: eff.y + dir[idx][1] * 20 }, 5000, Phaser.Easing.Circular.Out, true);
	    });

	    entity.kill();
	}

	function createJumpEffect(entity) {
	    if (entity.jumpEffect) {
	        return;
	    }var spr = entity.jumpEffect = entity.cloneSprite();
	    util.moveSiblingToChild(spr, entity);

	    spr.tint = 5131644;
	    spr.alpha = 1;

	    entity.game.add.tween(spr).to({
	        alpha: 0.3
	    }, 1000, Phaser.Easing.Circular.Out, true);
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (TILE_SIZE) {

	    function checkCollisions(map, prevY, newY, entity) {

	        function pointToTile(p) {
	            return Math.floor(p / TILE_SIZE);
	        }
	        function tileFromPoint(px, py) {
	            var x = pointToTile(px);
	            var y = pointToTile(py);
	            var tile = map.get(x, y);
	            return { x: x, y: y, tile: tile };
	        }

	        if (entity.width > TILE_SIZE) throw "Entity to wide";

	        var collision = { isCollision: false, y: 0, entity: null };

	        if (prevY > newY) {
	            return collision;
	        }if (newY >= entity.groundLevel - entity.height) {

	            collision.isCollision = true;
	            collision.y = entity.groundLevel;
	            return collision;
	        }

	        var flat = prevY == newY;

	        var jumpOn = function jumpOn(x) {
	            return (flat || !tileFromPoint(x, prevY + entity.height).tile) && tileFromPoint(x, newY + entity.height).tile;
	        };

	        var jumpLeft = jumpOn(entity.x);
	        var jumpRight = jumpOn(entity.x + entity.width);
	        if (jumpLeft || jumpRight) {
	            var tileX = jumpLeft ? pointToTile(entity.x) : pointToTile(entity.x + entity.width);
	            var tileY = pointToTile(newY + entity.height);
	            collision.isCollision = true;
	            collision.tileX = tileX;
	            collision.tileY = tileY;
	            collision.y = tileY * TILE_SIZE;
	            return collision;
	        }

	        return collision;
	    }

	    return checkCollisions;
	};

	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var templates = [["             2 ", "          1 13", "      1    ", "   1     ", "1       "], ["          ", "      2  ", "     2    ", " 3 1 3  3 ", "1        "], ["  3      ", "     2    ", " 3 1 3  3 ", "1111111"], ["1", "1", "1", "1"]];

	function pasteTemplate(template, x, y, array, entities) {
	    template.forEach(function (line, iy) {
	        line.forEach(function (c, ix) {
	            ix = Number(ix), iy = Number(iy);
	            if (!array[x + ix]) return;

	            if (c == "1") {
	                array[x + ix][y + iy] = 1;
	            } else if (c == " ") {
	                array[x + ix][y + iy] = 0;
	            }

	            if (c == "2") {
	                entities.push({ x: x + ix, y: y + iy, type: "point" });
	            }
	            if (c == "3") {
	                entities.push({ x: x + ix, y: y + iy, type: "enemy" });
	            }
	        });
	    });
	}

	function generateLevel(width, height, groundRotation) {
	    var array = new Array(width);

	    for (var i = 0; i < width; i++) {
	        array[i] = {};
	    }

	    for (var i = 0; i < width; i++) {
	        var offsetY = Math.floor(Math.sin(groundRotation) * i);

	        for (var j = 0; j < height; j++) {
	            // const idx = j * w + i;
	            var tile = Math.random() > 0.9 ? 1 : 0;

	            if (tile) {
	                array[i][j + offsetY] = tile;
	            }
	        }
	    }

	    var entities = [];

	    for (var i = 0; i < 50; i++) {
	        var type = "point";
	        var x = Math.floor(Math.random() * width);
	        var offsetY = Math.floor(Math.sin(groundRotation) * x);
	        var y = Math.floor(Math.random() * height) + offsetY;
	        entities.push({ type: type, x: x, y: y });
	    }

	    for (var i = 0; i < 50; i++) {
	        var type = "enemy";
	        var x = Math.floor(Math.random() * width);
	        var offsetY = Math.floor(Math.sin(groundRotation) * x);
	        var y = Math.floor(Math.random() * height) + offsetY;
	        entities.push({ type: type, x: x, y: y });
	    }

	    for (var i = 0; i < 100; i++) {

	        var offsetY = Math.floor(Math.sin(groundRotation) * i);

	        if (Math.random() > 0.8) {
	            var templateId = Math.floor(Math.random() * templates.length);

	            var x = Math.floor(Math.random() * width);
	            var y = Math.floor(Math.random() * height) + offsetY;
	            pasteTemplate(templates[templateId], x, y, array, entities);
	        }
	    }

	    return {
	        width: width, height: height,
	        array: array,
	        entities: entities,
	        get: function get(x, y) {
	            return array[x] && array[x][y];
	        },
	        iterate: function iterate(f) {
	            return array.forEach(function (arr, x) {
	                return arr.forEach(function (_, y) {
	                    return f(x, Number(y));
	                });
	            });
	        }
	    };
	}

	exports["default"] = generateLevel;
	module.exports = exports["default"];

/***/ }
/******/ ]);