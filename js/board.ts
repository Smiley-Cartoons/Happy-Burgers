"use strict"

let board: Board = null
let unitCardContainer = null

let thereIsDropUnit: boolean = false
const dropUnitId = "drop-unit"

let unitCardUnits: Unit[] = []
let selectedDropUnit: Unit = null

type healthBarInfoTuple = [XYCoord, Unit]

/** game Board on which Units live and fight for their Side and travel on Paths of XYCoords. */
class Board {
    private canvas: HTMLCanvasElement
    private readonly ctx: CanvasRenderingContext2D
    private originalBackgroundImage: HTMLImageElement
    private backgroundImage: HTMLImageElement = null
    x_spaces: number
    y_spaces: number
    /**How far this is pushed down this.canvas (so Units can be rendered at y of zero on this and still show on this.canvas) */
    y_spaces_offset: number = 15
    space_size: number
    private units: IUnit[] = null
    private healthBarsToRenderAtXY: healthBarInfoTuple[] = []
    static readonly millis_per_tick = 25
    gameIsOver = false

    /**AI or opponent's side */
    redFranchise: Franchise = null
    /**User's side */
    blueFranchise: Franchise = null
    /**What percent of this.y_spaces away from the back edge of the user's side of this the user may drop a new Unit. */
    readonly usersPercentOfBoard = 50
    showNoDropZone: boolean = false
    /** Franchise that won the game. Will be either this.redFranchise or this.blueFranchise */
    winner: Franchise = null

    constructor(backgroundImage: HTMLImageElement, canvasId = "game_board_element", x_spaces = 100, y_spaces = 120) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
        this.canvas.onclick = CanvasClickEvent
        this.originalBackgroundImage = backgroundImage
        this.backgroundImage = this.originalBackgroundImage

        this.ctx = this.canvas.getContext("2d")
        this.x_spaces = x_spaces
        this.y_spaces = y_spaces
        this.units = []

        this.gameIsOver = false

        this.redFranchise = new Franchise("Red")
        this.blueFranchise = new Franchise("Blue")
    }
    

    // Kicks off game clock ticking cycle
    startGame() {
        setTimeout(this._tick.bind(this), Board.millis_per_tick)
    }

    // Adjusts units for the current clock tick
    _tick() {
        // Resize canvas
        this.adjustBoard()
        this.renderBackground()

        this.redFranchise._tick()
        this.blueFranchise._tick()
        this.renderGreaseBarFill()

        if (this.showNoDropZone) {
            this.renderNoDropZone()
        }

        this.units.sort((u1, u2) => u1.y - u2.y)
        this.healthBarsToRenderAtXY = []

        this.units.forEach((unit, index, array) => {
            this.renderUnit(unit)
            if (unit as Unit) {
                this.healthBarsToRenderAtXY.push([new XYCoord(unit.x, unit.y), unit as Unit])
            }
            unit._tick()
        })

        this.healthBarsToRenderAtXY.forEach((bar) => {
            this.renderHealthBar(bar[0], bar[1])
        })
        
        this.checkIfGameIsOver()

        if (this.gameIsOver === false) {
            setTimeout(this._tick.bind(this), Board.millis_per_tick)
        } else {
            this.clearAll()
            this.declareWinner()
        }
    }

    private renderBackground() {
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
    }

    /**Draws over the background a red, translucent sheet to show the zone where the user may not drop a new Unit. */
    renderNoDropZone() {
        this.ctx.beginPath()
        this.ctx.rect(this.canvasX(0), this.canvasY(0),
                      this.x_spaces*this.space_size, 
                      this.y_spaces*this.space_size * (1- this.usersPercentOfBoard/100))

        this.ctx.fillStyle = "hsla(0, 100%, 60%, 45%)"
        this.ctx.fill()
        this.ctx.strokeStyle = "hsl(0, 100%, 60%)"
        this.ctx.stroke()
    }

    /** Congratulates the winning side/Franchise. */
    declareWinner() { // TODO: Actually implement this method.
        throw new Error("Method not implemented.")
    }

    /** Clears the canvas of units and resets the franchises. */
    clearAll() {
        this.units = []
        this.redFranchise.mainTower = null
        this.redFranchise.units = []
        this.blueFranchise.mainTower = null
        this.blueFranchise.units = []
        this.canvas.width = this.canvas.width
    }

    addUnit(unit: IUnit, side: Franchise = null) {
        if (side !== null) {
            unit.side = side
            side.units.push(unit)
        }
        this.units.push(unit)
    }

    checkIfGameIsOver() {
        if (this.redFranchise.mainTower.health <= 0) {
            this.gameIsOver = true
            if (this.blueFranchise.mainTower.health > 0) {
                this.winner = this.redFranchise
            }
        } else if (this.blueFranchise.mainTower.health <= 0) {
            this.gameIsOver = true
            this.winner = this.blueFranchise
        }
    }

    adjustBoard() {
        let w = document.documentElement.clientWidth
        //let h = document.documentElement.clientHeight

        if (w >= 769) {
            w = 759
        } else {
            w -= 10 // margin 5px
        }
        this.space_size = w / this.x_spaces

        this.canvas.width = this.canvasX(this.x_spaces)
        this.canvas.height = this.canvasY(this.y_spaces)
    }

    /**
     * Renders a Unit with it's y coordinate being it's bottom edge and it's x coordinate being at it's center.
     * Does not render a health bar for unit.
     * @param unit the Unit that gets drawn on the this.canvas
     */
    renderUnit(unit: IUnit) {
        let ratio = (unit.currentImage.width / unit.currentImage.height) * this.space_size
        let topLeftX = this.canvasX(unit.x) - ratio*unit.size/2
        let topLeftY = this.canvasY(unit.y) - this.space_size*unit.size
        let width = ratio*unit.size
        let height = this.space_size * unit.size

        this.ctx.drawImage(unit.currentImage, 
                        topLeftX, topLeftY, 
                        width, height)
    }

    /**
     * Draws a health bar for a Unit on this.
     * @param unit the Unit whose health bar gets drawn on this.canvas
     */
    renderHealthBar(coord: XYCoord, unit: Unit) {        
        let canvasX = this.canvasX(coord.x)
        let canvasY = this.canvasY(coord.y)

        let topLeftX = canvasX - unit.health_bar_width * this.space_size/2
        let topLeftY = canvasY - this.space_size * (unit.size + unit.health_bar_height)

        let width = unit.health_bar_width * unit.health/unit.originalHealth
        if (width < 0) {width = 0}
        if (width > unit.health_bar_width) {width = unit.health_bar_width}
        width *= this.space_size

        this.ctx.beginPath()
        this.ctx.rect(topLeftX, topLeftY, 
            unit.health_bar_width*this.space_size, 
            unit.health_bar_height*this.space_size)

        this.ctx.fillStyle = "hsl(0, 100%, 60%)"
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.rect(topLeftX, topLeftY, width, 
            unit.health_bar_height*this.space_size)
        this.ctx.fillStyle = "hsl(130, 100%, 50%)"
        this.ctx.fill()
    }

    renderGreaseBarFill(): void {
        const fill = document.getElementById("grease-bar-fill")
        fill.style.width = `${this.blueFranchise.grease*100/Franchise.max_grease}%`
    }

    canvasX(boardX: number): number {
        return boardX * this.space_size
    }
    canvasY(boardY: number): number {
        return (boardY + this.y_spaces_offset) * this.space_size
    }
    boardX(canvasX: number): number {
        return canvasX / this.space_size
    }
    boardY(canvasY: number): number {
        return canvasY / this.space_size - this.y_spaces_offset
    }
}

/** A path of points on a Board for Units to travel down */
class Path {
    points: XYCoord[] = null
    // Note: a path is basically an array of [x, y] pairs
    constructor(points?: XYCoord[]) {
        if (points !== undefined) {
            this.points = points
        }
    }
    point(n: number): XYCoord {
        n = Math.round(n)
        return this.points[n]
    }
    get start(): XYCoord {
        return this.points[0]
    }
    get end(): XYCoord {
        return this.points[this.points.length-1]
    }
}

/**
 * A game Board coordinate
 */
class XYCoord {
    x: number = 0
    y: number = 0
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

/** One of the two sides for which Units fight. Sends it's units to destroy the main tower of the other Franchise. */
class Franchise {
    name: string
    mainTower: Unit = null
    /**Includes this.mainTower */
    units: IUnit[] = []
    /**The currency/material this must have enough of to spawn a new Unit */
    grease: number = 0
    static readonly max_grease = 12
    /**How much grease this generates every second, ie how often this.grease += 1 */
    static readonly grease_per_sec = 1
    private grease_tick: number = 0
    static grease_ticks_per_sec: number = Franchise.grease_per_sec * 1000 / Board.millis_per_tick
    constructor(name: string) {
        this.name = name
    }

    _tick(): void {
        this.grease_tick++
        if (this.grease_tick > Franchise.grease_ticks_per_sec) {
            this.grease_tick = 0
            if (this.grease < Franchise.max_grease) {
                this.grease++
            }
        }
    }
}



//###################### SITE FUNCTIONS ######################//

/**
 * Adds fixed html elements to the window that allow the user to select a unit a drop a new one of it on the board.
 * This method is to be called after board init but before board.startGame()
 * @param units Static units that are cloned to add new units to the board.
 */
function RenderUnitCards(units: Unit[]): void {
    unitCardUnits = []

    let index = 0
    for (let unit of units) {
        const newCard = document.createElement("div")
        newCard.id = `unit-card${index}`
        unitCardUnits.push(unit)

        newCard.className = "unit-card"
        newCard.innerHTML = `<img src="${unit.images.atRestImages.item(Direction.Down)[0].src}">`

        let num = index
        newCard.onclick = (event) => { UnitCardClickEvent(event, newCard.id, num)}

        unitCardContainer.appendChild(newCard)
        index ++
    }
}

function UnitCardClickEvent(event: MouseEvent, unitCardId: string, index: number): void {
    selectedDropUnit = Object.assign({}, unitCardUnits[index])
    DeselectUnitCards()
    document.getElementById(unitCardId).classList.add("unit-card-selected")
    
    let dropUnitIsSpell = false // TODO: actually check if selectedDropUnit isn't a spell
    if (dropUnitIsSpell == false) {
        board.showNoDropZone = true
    }
}

function CanvasClickEvent(event: MouseEvent): void {
    if (selectedDropUnit != null && 
        selectedDropUnit.side.grease >= selectedDropUnit.grease_cost) {
        // calculate where the unit would be on the canvas
        let mouseBoardX = board.boardX(event.offsetX)
        let mouseBoardY = board.boardY(event.offsetY)

        if (userMayDrop(selectedDropUnit, mouseBoardX, mouseBoardY) == false) {
            return
        }
        board.showNoDropZone = false

        // drop it there 
        let newUnit = new Unit(selectedDropUnit.images, selectedDropUnit.side, selectedDropUnit.health, 0, 0, selectedDropUnit.grease_cost)        
        newUnit = Object.assign(newUnit, selectedDropUnit)
        newUnit.x = mouseBoardX
        newUnit.y = mouseBoardY + newUnit.size/2
        newUnit.targetPosition = new XYCoord(board.redFranchise.mainTower.x, 
                                             board.redFranchise.mainTower.y)
        board.addUnit(newUnit)

        selectedDropUnit.side.grease -= selectedDropUnit.grease_cost
        
        DeselectUnitCards()
        selectedDropUnit = null
    }
}

function userMayDrop(selectedDropUnit: Unit, boardX: number, boardY: number): boolean {
    return boardY > (1 - board.usersPercentOfBoard/100) * board.y_spaces
}

function DeselectUnitCards(): void {
    for (let unitCard of unitCardContainer.children) {
        unitCard.classList.remove("unit-card-selected")
    }
}

function StartGame(): void {       
    const background = new Image()
    background.src = "images/Backgrounds/Roads & grassy fields background.jpg"
    board = new Board(background)

    unitCardContainer = document.getElementById("unit-card-container")

    const RedTowerPoint = new XYCoord(board.x_spaces/2, 20)
    const BlueTowerPoint = new XYCoord(board.x_spaces/2, board.y_spaces-20)

    let restaurantImages = new UnitImages(new UnitGroupItemsByDirection([""], ["images/Restaurant/Restaurant_Down1.png"], [""], [""]))
    const RedRestaurant = new Unit(restaurantImages, board.redFranchise, 1200, RedTowerPoint.x, RedTowerPoint.y, 9, 30)
    const BlueRestaurant = new Unit(restaurantImages, board.blueFranchise, 1200, BlueTowerPoint.x, BlueTowerPoint.y, 9, 30)
    
    board.redFranchise.mainTower = RedRestaurant
    board.addUnit(RedRestaurant)
    board.blueFranchise.mainTower = BlueRestaurant
    board.addUnit(BlueRestaurant)

    let images = new UnitImages(new UnitGroupItemsByDirection(["images/Burger/Burger_Walking_Up1.jpg"], ["images/Burger/Burger_Walking_Down1.jpg"], ["images/Burger/Burger_Walking_Down1.jpg"], ["images/Burger/Burger_Walking_Down1.jpg"]))
    images.movingImages = new UnitGroupItemsByDirection(["images/Burger/Burger_Walking_Up1.jpg", "images/Burger/Burger_Walking_Up2.jpg", "images/Burger/Burger_Walking_Up1.jpg", "images/Burger/Burger_Walking_Up3.jpg"], 
                                                        ["images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down2.jpg", "images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down3.jpg"], 
                                                        ["images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down2.jpg", "images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down3.jpg"], 
                                                        ["images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down2.jpg", "images/Burger/Burger_Walking_Down1.jpg", "images/Burger/Burger_Walking_Down3.jpg"])

    let u1 = new Unit(images, board.blueFranchise, 100, 20, 40, 2, 12, 0.5)
    let u2 = new Unit(images, board.blueFranchise, 130, 40, 40, 3, 15, 0.6)
    let u3 = new Unit(images, board.blueFranchise, 80, 40, 40, 3, 10, 1)

    let units = [...[u1, u2, u3, u1, u2, u3, u1]]
    RenderUnitCards(units)
    board.startGame()
}
