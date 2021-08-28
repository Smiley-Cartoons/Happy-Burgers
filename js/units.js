"use strict";
class Unit {
    /**
     * @param  {UnitImages} images images used for this's animations.
     * @param  {Franchise} side whether this is fighting for the blue side or the red side
     * @param  {number} health
     * @param  {number} x board x coordinate
     * @param  {number} y board y coordinate
     * @param  {number=10} size diameter of unit in board spaces
     */
    constructor(images, side, health, x, y, size = 10) {
        this.health_bar_width = 12;
        this.health_bar_height = 2;
        this.isFighting = false;
        this.direction = Direction.Down;
        this.speed = 0;
        this.damage = 0;
        this.armor = 0;
        this.armorPiercing = 0;
        // where the unit is going to
        this.targetPosition = null;
        this.images = images;
        this.currentImage = images.atRestImages.item(Direction.Down); // todo: determine which image should be the initial image
        this.side = side;
        this.originalHealth = health;
        this.health = health;
        this.x = x;
        this.y = y;
        this.size = size;
        this.health_bar_width = size * 4 / 5;
        this.health_bar_height = this.health_bar_width / 6;
    }
    _tick() {
        if (this.health <= 0) {
            // todo: make the unit die
        }
        else if (this.isFighting) {
            // todo: fight
        }
        else if (this.doesWantToTravel) { // move towards target position
            this.moveToTargetPosition();
            // TODO: cycle through movement animation pics
        }
        else {
            // todo: make the unit be at rest
        }
    }
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
            // change direction (down, up, left, right) based on angle
            let movementAngle = Math.atan2(xdis, -ydis) * 180 / Math.PI; // minus ydis because in html +y is down
            if (-135 < movementAngle && movementAngle < -45) {
                this.direction = Direction.Down;
            }
            else if (-45 < movementAngle && movementAngle < 45) {
                this.direction = Direction.Left;
            }
            else if (45 < movementAngle && movementAngle < 135) {
                this.direction = Direction.Up;
            }
            else {
                this.direction = Direction.Right;
            }
        }
    }
    get doesWantToTravel() {
        if (this.targetPosition == null) {
            return false;
        }
        return this.x !== this.targetPosition.x || this.y !== this.targetPosition.y;
    }
}
class UnitImages {
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
class UnitGroupItemsByDirection {
    constructor(upItem, downItem, leftItem, rightItem) {
        this.items = [upItem, downItem, leftItem, rightItem];
    }
    item(n) {
        return this.items[n];
    }
}
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
