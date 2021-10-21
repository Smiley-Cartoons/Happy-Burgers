"use strict"

interface IUnit {
    cardImage: HTMLImageElement
    currentImage: HTMLImageElement
    x: number
    y: number
    size: number

    side: Franchise
    /**how much grease it costs this.side to spawn this */
    grease_cost: number
    speed: number
    damage: number
    armorPiercing: number

    // where the unit is going to
    targetPosition: XYCoord

    _tick(): void
}

/**
 * A tower/soldier/whatever to fight for a Side on a game Board
 */
class Unit implements IUnit {
    images: UnitImages
    cardImage: HTMLImageElement = null
    currentImage: HTMLImageElement
    x: number
    y: number
    size: number
    health_bar_width = 12
    health_bar_height = 2
    private img_tick:number = 1
    private img_index:number = 0
    ticks_per_image:number = 1
    animationTime:number = 1 // in seconds
    isFighting: boolean = false
    direction: Direction = Direction.Down

    side: Franchise
    /**how much grease it costs this.side to spawn this */
    grease_cost: number
    originalHealth: number
    health = 1
    speed = 0
    damage = 0
    armor = 0
    armorPiercing = 0

    // where the unit is going to
    targetPosition: XYCoord = null

    /**
     * @param  {UnitImages} images images used for this's animations.
     * @param  {Franchise} side whether this is fighting for the blue side or the red side
     * @param  {number} health
     * @param  {number} x board x coordinate
     * @param  {number} y board y coordinate
     * @param  {number} grease_cost how much grease it costs this.side to spawn this
     * @param  {number} size height of unit in board spaces. width is derived from this stat.
     */
    constructor(images: UnitImages, cardImage: string, side: Franchise, health = 100, x = 0, y = 0, grease_cost = 1, 
                size = 5, speed = 0, damage = 0, armor = 0, armorPiercing = 0) {
        this.images = images
        if (images != null) {
            this.currentImage = images.atRestImages.item(Direction.Down)[0] // TODO: determine which image should be the initial image
        }
        this.cardImage = new Image()
        this.cardImage.src = cardImage

        this.side = side

        this.grease_cost = grease_cost

        this.originalHealth = health
        this.health = health
        this.x = x
        this.y = y
        this.size = size
        this.speed = speed
        this.damage = damage
        this.armor = armor
        this.armorPiercing = armorPiercing

        this.health_bar_width = size*4/5
        this.health_bar_height = this.health_bar_width/6
    }

    _tick(): void {        
        if (this.health <= 0) {
            // TODO: make the unit die
        }
        else if (this.isFighting) {
            // TODO: fight
            //this.calcDirection(this.x - // TODO: get opponent x, this.y - // TODO: get opponent y)
        }
        else if (this.doesWantToTravel) { // move towards target position
            this.moveToTargetPosition()
            let movingImages = this.images.movingImages.item(this.direction)
            this.ticks_per_image = 1000*(this.animationTime/movingImages.length) / Board.millis_per_tick // TODO: refactor: move equations so they're not calculated every frame?
            this.img_tick +=1

            if (this.img_tick>this.ticks_per_image){
                this.img_tick=1
                this.img_index +=1
                if (this.img_index >= movingImages.length) {
                    this.img_index = 0
                }
            }

            this.currentImage = movingImages[this.img_index]
            
        }
        else {
            // TODO: make the unit be at rest
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
        let ma = Math.atan2(-ydis, xdis)
        let movementAngle = ma*180/Math.PI // minus ydis because in html and on the board +y is down
        if (-135 < movementAngle && movementAngle < -45) { this.direction = Direction.Down}
        else if (-45 < movementAngle && movementAngle < 45) { this.direction = Direction.Right}
        else if (45 < movementAngle && movementAngle < 135) { this.direction = Direction.Up}
        else { this.direction = Direction.Left}
    }

    get doesWantToTravel(): boolean {
        if (this.targetPosition == null) {
            return false
        }
        return this.x !== this.targetPosition.x || this.y !== this.targetPosition.y
    }
}

/**
 * Container for a Unit's image objects. Those images are grouped by animation, 
 * then by direction through the UnitGroupItemsByDirection class
 */
class UnitImages {
    atRestImages: UnitGroupItemsByDirection = null

    movingImages: UnitGroupItemsByDirection = null
    fightingImages: UnitGroupItemsByDirection = null
    dyingImages: UnitGroupItemsByDirection = null

    /**
     * Creates a new UnitImages object.
     * If a UnitGroupItemsByDirection object is given, it sets it as this.atRestImages.
     * @param atRestImages The images used by a Unit when it is not moving.
     */
    constructor(atRestImages: UnitGroupItemsByDirection = null) {
        if (atRestImages != null) {
            this.atRestImages = atRestImages
        }
    }
}

/**
 * Divides a UnitImages animation into arrays of images for each value of Direction .
 */
class UnitGroupItemsByDirection {
    private items: HTMLImageElement[][] = []
    constructor(upItem: string[], downItem: string[], leftItem: string[], rightItem: string[]) {
        for (let item of [upItem, downItem, leftItem, rightItem]) {
            let newItem: HTMLImageElement[] = []
            for (let src of item) {
                let newI = new Image()
                newI.src = src
                newItem.push(newI)
            }
            this.items.push(newItem)
        }
    }

    /**
     * Returns an array of images which are an animation as seen from Direction n.
     * @param n a Direction value
     * @returns an array of images which are an animation as seen from Direction n.
     */
    item(n: Direction): HTMLImageElement[] {
        return this.items[n]
    }
}

/**
 * A direction from which a user may view a Unit's animation.
 */
enum Direction {
    Up,
    Down,
    Left,
    Right
}


class Spell implements IUnit {
    images: HTMLImageElement[] = [] // TODO: finish spell class
    cardImage: HTMLImageElement = null
    currentImage: HTMLImageElement = null
    x = 0
    y = 0
    size = 0
    side: Franchise = null
    grease_cost = 0
    speed = 0
    damage = 0
    armorPiercing = 0
    targetPosition: XYCoord = null

    /**
     * The time in milliseconds this Spell lasts before being removed.
     */
    duration = 1000
    /**
     * How many milliseconds this has been around.
     */
    private age = 0

    /** 
     * (Must accept one parameter, being of type Spell, that is at runtime the spell calling this function.)
     * 
     * The action this performs every board tick.
     */
    spell: Function = (spell: Spell) => { return spell !== null}

    private img_tick:number = 1
    private img_index:number = 0
    ticks_per_image:number = 1
    animationTime:number = 1 // in seconds

    constructor(images: string[] = null, cardImage: string = null) {
        if (images !== null) {
            for (let img of images) {
                let newImg = new Image()
                newImg.src = img
                this.images.push(newImg)
            }
            this.currentImage = this.images[0]
        }
        if (cardImage !== null) {
            this.cardImage = new Image()
            this.cardImage.src = cardImage
        }

    }

    _tick(): void {
        this.age += Board.millis_per_tick

        if (this.age > this.duration) {
            board.removeUnit(this)
        }
        else { // do spell animation
            this.ticks_per_image = 1000*(this.animationTime/this.images.length) / Board.millis_per_tick // TODO: refactor: move equations so they're not calculated every frame?
            this.img_tick +=1

            if (this.img_tick>this.ticks_per_image){
                this.img_tick=1
                this.img_index +=1
                if (this.img_index >= this.images.length) {
                    this.img_index = 0
                }
            }

            this.currentImage = this.images[this.img_index]
            
            // Execute spell action
            this.spell(this)
        }
    }

    surroundingUnits(): Unit[] {
        let units = []
        for (let unit of board.units) {
            if (unit.constructor.name == Unit.name) {
                let xdis = this.x - unit.x
                let ydis = this.y - unit.y
                let netdis = Math.sqrt(xdis**2 + ydis**2)

                if (netdis < (this.size + unit.size)/2) {
                    units.push(unit)
                }
            }
        }
        return units
    }
}






//######################################################################################################################
//
//      UNIT STATS
//
//######################################################################################################################


const Cheese = new Spell(["images/Spells/Cheese/Cheese_Melting1.png", 
                          "images/Spells/Cheese/Cheese_Melting2.png", 
                          "images/Spells/Cheese/Cheese_Melting3.png"],
                          "images/Spells/Cheese/Cheeseblock1.png")
Cheese.spell = (spell: Spell) => {//TODO: implement slow down unit
                                    }
Cheese.duration = 2000
Cheese.grease_cost = 2
Cheese.size = 8
Cheese.speed = 0
Cheese.damage = 0


let burgerImages = new UnitImages(new UnitGroupItemsByDirection(["images/Burger/Burger_Walking_Up1.png"], ["images/Burger/Burger_Walking_Down1.jpg"], ["images/Burger/Burger_Walking_Left2.png"], ["images/Burger/Burger_Walking_Right2.png"]))
burgerImages.movingImages = new UnitGroupItemsByDirection(
                                ["images/Burger/Burger_Walking_Up1.png", "images/Burger/Burger_Walking_Up2.png", "images/Burger/Burger_Walking_Up1.png", "images/Burger/Burger_Walking_Up3.png"], 
                                ["images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down2.jpg", "images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down3.jpg"], 
                                ["images/Burger/Burger_Walking_Left1.png", "images/Burger/Burger_Walking_Left2.png"],
                                ["images/Burger/Burger_Walking_Right1.png", "images/Burger/Burger_Walking_Right2.png"])
burgerImages.fightingImages = null // TODO: Add fighting images!
burgerImages.dyingImages = new UnitGroupItemsByDirection(
                                ["images/Unit Deaths/Ketchupandmustard_BlowUp1.png", "images/Unit Deaths/Ketchupandmustard_BlowUp2.png", "images/Unit Deaths/Ketchupandmustard_BlowUp3.png"],
                                ["images/Unit Deaths/Ketchupandmustard_BlowUp1.png", "images/Unit Deaths/Ketchupandmustard_BlowUp2.png", "images/Unit Deaths/Ketchupandmustard_BlowUp3.png"],
                                ["images/Unit Deaths/Ketchupandmustard_BlowUp1.png", "images/Unit Deaths/Ketchupandmustard_BlowUp2.png", "images/Unit Deaths/Ketchupandmustard_BlowUp3.png"],
                                ["images/Unit Deaths/Ketchupandmustard_BlowUp1.png", "images/Unit Deaths/Ketchupandmustard_BlowUp2.png", "images/Unit Deaths/Ketchupandmustard_BlowUp3.png"])

const Burger = new Unit(burgerImages, "images/Burger/Burger_Walking_Down1.jpg", null)
Burger.health = 100
Burger.grease_cost = 2
Burger.size = 5
Burger.speed = 0.5
Burger.damage = 15



