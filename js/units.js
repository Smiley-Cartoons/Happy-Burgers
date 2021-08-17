// JavaScript source code for doing stuff with the webpage(s)
class Unit {
    constructor(images, health, x, y, size = 10) {
        this.health_bar_width = 12;
        this.health_bar_height = 2;
        this.originalHealth = health;
        this.health = health;
        this.x = x;
        this.y = y;
        this.size = size;
        this.health_bar_width = 12;
        this.health_bar_height = 2;
        this.images = images;
    }
    _tick() {
        // TODO: cycle through animation pics
    }
}
class UnitImages {
    constructor() {
        this.atRestImage = null;
        this.movingDownImages = null;
        this.movingUpImages = null;
        this.movingLeftImages = null;
        this.movingRightImages = null;
        this.fightingDownImages = null;
        this.fightingUpImages = null;
        this.fightingLeftImages = null;
        this.fightingRightImages = null;
    }
}
