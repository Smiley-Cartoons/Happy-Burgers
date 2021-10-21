"use strict";
/**
 * A tower/soldier/whatever to fight for a Side on a game Board
 */
class Unit {
    /**
     * @param  {UnitImages} images images used for this's animations.
     * @param  {Franchise} side whether this is fighting for the blue side or the red side
     * @param  {number} health
     * @param  {number} x board x coordinate
     * @param  {number} y board y coordinate
     * @param  {number} grease_cost how much grease it costs this.side to spawn this
     * @param  {number} size height of unit in board spaces. width is derived from this stat.
     */
    constructor(images, side, health, x, y, grease_cost, size, speed = 0, damage = 0) {
        this.cardImage = null;
        this.health_bar_width = 12;
        this.health_bar_height = 2;
        this.img_tick = 1;
        this.img_index = 0;
        this.ticks_per_image = 1;
        this.animationTime = 1; // in seconds
        this.isFighting = false;
        this.direction = Direction.Down;
        this.speed = 0;
        this.damage = 0;
        this.armor = 0;
        this.armorPiercing = 0;
        // where the unit is going to
        this.targetPosition = null;
        this.images = images;
        if (images != null) {
            this.currentImage = images.atRestImages.item(Direction.Down)[0]; // TODO: determine which image should be the initial image
        }
        this.side = side;
        this.grease_cost = grease_cost;
        this.originalHealth = health;
        this.health = health;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.damage = damage;
        this.health_bar_width = size * 4 / 5;
        this.health_bar_height = this.health_bar_width / 6;
    }
    _tick() {
        if (this.health <= 0) {
            // TODO: make the unit die
        }
        else if (this.isFighting) {
            // TODO: fight
            //this.calcDirection(this.x - // TODO: get opponent x, this.y - // TODO: get opponent y)
        }
        else if (this.doesWantToTravel) { // move towards target position
            this.moveToTargetPosition();
            let movingImages = this.images.movingImages.item(this.direction);
            this.ticks_per_image = 1000 * (this.animationTime / movingImages.length) / Board.millis_per_tick; // TODO: refactor: move equations so they're not calculated every frame?
            this.img_tick += 1;
            if (this.img_tick > this.ticks_per_image) {
                this.img_tick = 1;
                this.img_index += 1;
                if (this.img_index >= movingImages.length) {
                    this.img_index = 0;
                }
            }
            this.currentImage = movingImages[this.img_index];
        }
        else {
            // TODO: make the unit be at rest
            this.currentImage = this.images.atRestImages.item(this.direction)[0];
        }
    }
    /**
     * Moves this towards this.targetPosition by this.speed per call.
     * Also auto has this.direction re-calculated
     */
    moveToTargetPosition() {
        let xdis = this.targetPosition.x - this.x;
        let ydis = this.targetPosition.y - this.y;
        let netdis = Math.sqrt(Math.pow(xdis, 2) + Math.pow(ydis, 2));
        if (netdis <= this.speed) { // if the current frame would take this past targetPosition, just have it be there
            this.x = this.targetPosition.x;
            this.y = this.targetPosition.y;
        }
        else {
            let xMovement = this.speed * xdis / netdis;
            let yMovement = this.speed * ydis / netdis;
            this.x += xMovement;
            this.y += yMovement;
            this.calcDirection(xdis, ydis);
        }
    }
    /**
     * Sets this.direction based on where the target is that this should face towards
     * @param xdis x board distance between this and target it should be facing
     * @param ydis y board distance between this and target it should be facing
     */
    calcDirection(xdis, ydis) {
        // change direction (down, up, left, right) based on angle
        let ma = Math.atan2(-ydis, xdis);
        let movementAngle = ma * 180 / Math.PI; // minus ydis because in html and on the board +y is down
        if (-135 < movementAngle && movementAngle < -45) {
            this.direction = Direction.Down;
        }
        else if (-45 < movementAngle && movementAngle < 45) {
            this.direction = Direction.Right;
        }
        else if (45 < movementAngle && movementAngle < 135) {
            this.direction = Direction.Up;
        }
        else {
            this.direction = Direction.Left;
        }
    }
    get doesWantToTravel() {
        if (this.targetPosition == null) {
            return false;
        }
        return this.x !== this.targetPosition.x || this.y !== this.targetPosition.y;
    }
}
/**
 * Container for a Unit's image objects. Those images are grouped by animation,
 * then by direction through the UnitGroupItemsByDirection class
 */
class UnitImages {
    /**
     * Creates a new UnitImages object.
     * If a UnitGroupItemsByDirection object is given, it sets it as this.atRestImages.
     * @param atRestImages The images used by a Unit when it is not moving.
     */
    constructor(atRestImages = null) {
        this.atRestImages = null;
        this.movingImages = null;
        this.fightingImages = null;
        this.dyingImages = null;
        if (atRestImages != null) {
            this.atRestImages = atRestImages;
        }
    }
}
/**
 * Divides a UnitImages animation into arrays of images for each value of Direction .
 */
class UnitGroupItemsByDirection {
    constructor(upItem, downItem, leftItem, rightItem) {
        this.items = [];
        for (let item of [upItem, downItem, leftItem, rightItem]) {
            let newItem = [];
            for (let src of item) {
                let newI = new Image();
                newI.src = src;
                newItem.push(newI);
            }
            this.items.push(newItem);
        }
    }
    /**
     * Returns an array of images which are an animation as seen from Direction n.
     * @param n a Direction value
     * @returns an array of images which are an animation as seen from Direction n.
     */
    item(n) {
        return this.items[n];
    }
}
/**
 * A direction from which a user may view a Unit's animation.
 */
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
class Spell {
    constructor(images = null, cardImage = null) {
        this.images = []; // TODO: finish spell class
        this.cardImage = null;
        this.currentImage = null;
        this.x = 0;
        this.y = 0;
        this.size = 0;
        this.side = null;
        this.grease_cost = 0;
        this.speed = 0;
        this.damage = 0;
        this.armorPiercing = 0;
        this.targetPosition = null;
        /**
         * The time in milliseconds this Spell lasts before being removed.
         */
        this.duration = 1000;
        /**
         * How many milliseconds this has been around.
         */
        this.age = 0;
        /**
         * (Must accept one parameter, being of type Spell, that is at runtime the spell calling this function.)
         *
         * The action this performs every board tick.
         */
        this.spell = (spell) => { return spell !== null; };
        this.img_tick = 1;
        this.img_index = 0;
        this.ticks_per_image = 1;
        this.animationTime = 1; // in seconds
        if (images !== null) {
            for (let img of images) {
                let newImg = new Image();
                newImg.src = img;
                this.images.push(newImg);
            }
            this.currentImage = this.images[0];
        }
        if (cardImage !== null) {
            this.cardImage = new Image();
            this.cardImage.src = cardImage;
        }
    }
    _tick() {
        this.age += Board.millis_per_tick;
        if (this.age > this.duration) {
            // TODO: make the spell not exist anymore
        }
        else { // do spell animation
            this.ticks_per_image = 1000 * (this.animationTime / this.images.length) / Board.millis_per_tick; // TODO: refactor: move equations so they're not calculated every frame?
            this.img_tick += 1;
            if (this.img_tick > this.ticks_per_image) {
                this.img_tick = 1;
                this.img_index += 1;
                if (this.img_index >= this.images.length) {
                    this.img_index = 0;
                }
            }
            this.currentImage = this.images[this.img_index];
            // Execute spell action
            this.spell(this);
        }
    }
}
//######################################################################################################################
//
//      UNIT STATS
//
//######################################################################################################################
const Cheese = new Spell(["images/Spells/Cheese/Cheese_Melting1.png",
    "images/Spells/Cheese/Cheese_Melting2.png",
    "images/Spells/Cheese/Cheese_Melting3.png"], "images/Spells/Cheese/Cheeseblock1.png");
Cheese.spell = (spell) => {
};
Cheese.duration = 2000;
Cheese.grease_cost = 2;
Cheese.size = 8;
Cheese.speed = 0;
Cheese.damage = 0;
