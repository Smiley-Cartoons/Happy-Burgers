"use strict"

class Unit {
    images: UnitImages
    currentImage: HTMLImageElement
    x: number
    y: number
    size: number
    health_bar_width: number = 12
    health_bar_height: number = 2
    isFighting: boolean = false

    side: Franchise
    originalHealth: number
    health: number
    speed: number = 0
    damage: number = 0
    armor: number = 0
    armorPiercing: number = 0

    // where the unit is going to
    targetPosition: XYCoord = null

    constructor(images: UnitImages, side: Franchise, health: number, x: number, y: number, size: number = 10) {
        this.images = images
        this.currentImage = images.atRestDownImage // todo: determine which image should be the initial image

        this.side = side

        this.originalHealth = health
        this.health = health
        this.x = x
        this.y = y
        this.size = size

        this.health_bar_width = 12
        this.health_bar_height = 2
    }

    _tick(): void {        
        if (this.health <= 0) {
            // todo: make the unit die
        }
        else if (this.isFighting) {
            // todo: fight
        }
        else if (this.doesWantToTravel) { // move towards target position
            this.moveToTargetPosition()
            // TODO: cycle through movement animation pics
        }
        else {
            // todo: make the unit be at rest
        }
    }

    moveToTargetPosition(): void {
        let xdis = this.targetPosition.x - this.x
        let ydis = this.targetPosition.y - this.y
        let netdis = Math.sqrt(xdis**2 + ydis**2)

        if (netdis <= this.speed) { // if the current frame would take this past targetPosition, just have it be there
            this.x = this.targetPosition.x
            this.y = this.targetPosition.y
        } else {
            let xMovement = this.speed * xdis/netdis
            let yMovement = this.speed * ydis/netdis
            this.x += xMovement
            this.y += yMovement

            let movementAngle = Math.atan2(xdis, -ydis) // minus ydis because in html +y is down
            // todo: change direction (down, up, left, right) based on angle
        }
    }

    get doesWantToTravel(): boolean {
        if (this.targetPosition == null) {
            return false
        }
        return this.x !== this.targetPosition.x && this.y !== this.targetPosition.y
    }
}

class UnitImages {
    atRestDownImage: HTMLImageElement = null
    atRestUpImage: HTMLImageElement = null
    atRestLeftImage: HTMLImageElement = null
    atRestRightImage: HTMLImageElement = null

    movingDownImages: HTMLImageElement[] = null
    movingUpImages: HTMLImageElement[] = null
    movingLeftImages: HTMLImageElement[] = null
    movingRightImages: HTMLImageElement[] = null

    fightingDownImages: HTMLImageElement[] = null
    fightingUpImages: HTMLImageElement[] = null
    fightingLeftImages: HTMLImageElement[] = null
    fightingRightImages: HTMLImageElement[] = null

    dyingDownImages: HTMLImageElement[] = null
    dyingUpImages: HTMLImageElement[] = null
    dyingLeftImages: HTMLImageElement[] = null
    dyingRightImages: HTMLImageElement[] = null
}

// which side the unit is on, the franchise that makes it and sends it to battle
type Franchise = "Red" | "Blue"