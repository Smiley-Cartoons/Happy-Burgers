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
    direction: Direction = Direction.Down

    side: Franchise
    originalHealth: number
    health: number
    speed: number = 0
    damage: number = 0
    armor: number = 0
    armorPiercing: number = 0

    // where the unit is going to
    targetPosition: XYCoord = null

    /**
     * @param  {UnitImages} images images used for this's animations.
     * @param  {Franchise} side whether this is fighting for the blue side or the red side
     * @param  {number} health
     * @param  {number} x board x coordinate
     * @param  {number} y board y coordinate
     * @param  {number=10} size diameter of unit in board spaces
     */
    constructor(images: UnitImages, side: Franchise, health: number, x: number, y: number, size: number = 10) {
        this.images = images
        if (images != null) {
            this.currentImage = images.atRestImages.item(Direction.Down)[0] // todo: determine which image should be the initial image
        }
        this.side = side

        this.originalHealth = health
        this.health = health
        this.x = x
        this.y = y
        this.size = size

        this.health_bar_width = size*4/5
        this.health_bar_height = this.health_bar_width/6
    }

    _tick(): void {        
        if (this.health <= 0) {
            // todo: make the unit die
        }
        else if (this.isFighting) {
            // todo: fight
            //this.calcDirection(this.x - // todo: get opponent x, this.y - // todo: get opponent y)
        }
        else if (this.doesWantToTravel) { // move towards target position
            this.moveToTargetPosition()
            // TODO: cycle through movement animation pics
        }
        else {
            // todo: make the unit be at rest
            this.currentImage = this.images.atRestImages.item(this.direction)[0]
        }
    }

    /**
     * Moves this towards this.targetPosition by this.speed per call.
     * Also auto has this.direction re-calculated
     */
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

            this.calcDirection(xdis, ydis)
        }
    }

    /**
     * Sets this.direction based on where the target is that this should face towards
     * @param xdis x board distance between this and target it should be facing 
     * @param ydis y board distance between this and target it should be facing 
     */
    calcDirection(xdis: number, ydis: number): void {
        // change direction (down, up, left, right) based on angle
        let movementAngle = Math.atan2(xdis, -ydis)*180/Math.PI // minus ydis because in html and on the board +y is down
        if (-135 < movementAngle && movementAngle < -45) { this.direction = Direction.Down}
        else if (-45 < movementAngle && movementAngle < 45) { this.direction = Direction.Left}
        else if (45 < movementAngle && movementAngle < 135) { this.direction = Direction.Up}
        else { this.direction = Direction.Right}
    }

    get doesWantToTravel(): boolean {
        if (this.targetPosition == null) {
            return false
        }
        return this.x !== this.targetPosition.x || this.y !== this.targetPosition.y
    }
}

class UnitImages {
    atRestImages: UnitGroupItemsByDirection = null

    movingImages: UnitGroupItemsByDirection = null
    fightingImages: UnitGroupItemsByDirection = null
    dyingImages: UnitGroupItemsByDirection = null
    constructor(atRestImages: UnitGroupItemsByDirection = null) {
        if (atRestImages != null) {
            this.atRestImages = atRestImages
        }
    }
}

class UnitGroupItemsByDirection {
    private items: HTMLImageElement[][]
    constructor(upItem: string[], downItem: string[], leftItem: string[], rightItem: string[]) {
        for (let item of [upItem, downItem, leftItem, rightItem]) {
            let newItem: HTMLImageElement[]
            for (let src of item) {
                let newI = new Image()
                newI.src = src
                newItem.push(newI)
            }
            this.items.push(newItem)
        }
    }
    item(n: Direction): HTMLImageElement[] {
        return this.items[n]
    }
}

// which side the unit is on, the franchise that makes it and sends it to battle
type Franchise = "Red" | "Blue"

enum Direction {
    Up,
    Down,
    Left,
    Right
}