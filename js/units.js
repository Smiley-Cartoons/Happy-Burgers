"use strict";
class Unit {
    constructor(images, side, health, x, y, size = 10) {
        this.health_bar_width = 12;
        this.health_bar_height = 2;
        this.isFighting = false;
        this.speed = 0;
        this.damage = 0;
        this.armor = 0;
        this.armorPiercing = 0;
        // where the unit is going to
        this.targetPosition = null;
        this.images = images;
        this.currentImage = images.atRestDownImage; // todo: determine which image should be the initial image
        this.side = side;
        this.originalHealth = health;
        this.health = health;
        this.x = x;
        this.y = y;
        this.size = size;
        this.health_bar_width = 12;
        this.health_bar_height = 2;
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
            let movementAngle = Math.atan2(xdis, -ydis); // minus ydis because in html +y is down
            // todo: change direction (down, up, left, right) based on angle
        }
    }
    get doesWantToTravel() {
        if (this.targetPosition == null) {
            return false;
        }
        return this.x !== this.targetPosition.x && this.y !== this.targetPosition.y;
    }
}
class UnitImages {
    constructor() {
        this.atRestDownImage = null;
        this.atRestUpImage = null;
        this.atRestLeftImage = null;
        this.atRestRightImage = null;
        this.movingDownImages = null;
        this.movingUpImages = null;
        this.movingLeftImages = null;
        this.movingRightImages = null;
        this.fightingDownImages = null;
        this.fightingUpImages = null;
        this.fightingLeftImages = null;
        this.fightingRightImages = null;
        this.dyingDownImages = null;
        this.dyingUpImages = null;
        this.dyingLeftImages = null;
        this.dyingRightImages = null;
    }
}
