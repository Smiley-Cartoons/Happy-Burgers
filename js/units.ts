// JavaScript source code for doing stuff with the webpage(s)

class Unit {
    images: UnitImages
    originalHealth: number
    health: number
    x: number
    y: number
    size: number
    health_bar_width: number = 12
    health_bar_height: number = 2
    constructor(images: UnitImages, health: number, x: number, y: number, size: number = 10) {
        this.originalHealth = health
        this.health = health
        this.x = x
        this.y = y
        this.size = size

        this.health_bar_width = 12
        this.health_bar_height = 2

        this.images = images
    }

    _tick() {
        // TODO: cycle through animation pics
    }
}

class UnitImages {
    atRestImage: HTMLImageElement = null
    movingDownImages: HTMLImageElement[] = null
    movingUpImages: HTMLImageElement[] = null
    movingLeftImages: HTMLImageElement[] = null
    movingRightImages: HTMLImageElement[] = null
    fightingDownImages: HTMLImageElement[] = null
    fightingUpImages: HTMLImageElement[] = null
    fightingLeftImages: HTMLImageElement[] = null
    fightingRightImages: HTMLImageElement[] = null
}