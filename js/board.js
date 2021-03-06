"use strict";
let board = null;
let unitCardContainer = null;
let thereIsDropUnit = false;
const dropUnitId = "drop-unit";
let unitCardUnits = [];
let selectedDropUnit = null;
/** game Board on which Units live and fight for their Side and travel on Paths of XYCoords. */
class Board {
    constructor(backgroundImage, canvasId = "game_board_element", x_spaces = 100, y_spaces = 120) {
        this.backgroundImage = null;
        /**How far this is pushed down this.canvas (so Units can be rendered at y of zero on this and still show on this.canvas) */
        this.y_spaces_offset = 15;
        this._units = null;
        this.healthBarsToRenderAtXY = [];
        this.gameIsOver = false;
        /**AI or opponent's side */
        this.redFranchise = null;
        this.redSideName = "Red";
        /**User's side */
        this.blueFranchise = null;
        this.blueSideName = "Blue";
        /**What percent of this.y_spaces away from the back edge of the user's side of this the user may drop a new Unit. */
        this.usersPercentOfBoard = 50;
        this.showNoDropZone = false;
        /** Franchise that won the game. Will be either this.redFranchise or this.blueFranchise */
        this.winner = null;
        this.canvas = document.getElementById(canvasId);
        this.canvas.onclick = CanvasClickEvent;
        this.originalBackgroundImage = backgroundImage;
        this.backgroundImage = this.originalBackgroundImage;
        this.ctx = this.canvas.getContext("2d");
        this.x_spaces = x_spaces;
        this.y_spaces = y_spaces;
        this._units = [];
        this.gameIsOver = false;
        this.redFranchise = new Franchise(this.redSideName);
        this.blueFranchise = new Franchise(this.blueSideName);
    }
    // Kicks off game clock ticking cycle
    startGame() {
        setTimeout(this._tick.bind(this), Board.millis_per_tick);
    }
    // Adjusts units for the current clock tick
    _tick() {
        // Resize canvas
        this.adjustBoard();
        this.renderBackground();
        this.redFranchise._tick();
        this.blueFranchise._tick();
        this.renderGreaseBarFill();
        if (this.showNoDropZone) {
            this.renderNoDropZone();
        }
        this._units.sort((u1, u2) => u1.y - u2.y);
        this.healthBarsToRenderAtXY = [];
        this._units.forEach((unit, index, array) => {
            if (unit === null) {
                this._units.splice(index, 1);
            }
            this.renderUnit(unit);
            if (unit) {
                this.healthBarsToRenderAtXY.push([new XYCoord(unit.x, unit.y), unit]);
            }
            unit._tick();
        });
        this.healthBarsToRenderAtXY.forEach((bar) => {
            this.renderHealthBar(bar[0], bar[1]);
        });
        this.checkIfGameIsOver();
        if (this.gameIsOver === false) {
            setTimeout(this._tick.bind(this), Board.millis_per_tick);
        }
        else {
            this.clearAll();
            this.declareWinner();
        }
    }
    renderBackground() {
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    }
    /**Draws over the background a red, translucent sheet to show the zone where the user may not drop a new Unit. */
    renderNoDropZone() {
        this.ctx.beginPath();
        this.ctx.rect(this.canvasX(0), this.canvasY(0), this.x_spaces * this.space_size, this.y_spaces * this.space_size * (1 - this.usersPercentOfBoard / 100));
        this.ctx.fillStyle = "hsla(0, 100%, 60%, 45%)";
        this.ctx.fill();
        this.ctx.strokeStyle = "hsl(0, 100%, 60%)";
        this.ctx.stroke();
    }
    /** Congratulates the winning side/Franchise. */
    declareWinner() {
        throw new Error("Method not implemented.");
    }
    /** Clears the canvas of units and resets the franchises. */
    clearAll() {
        this._units = [];
        this.redFranchise.mainTower = null;
        this.redFranchise.units = [];
        this.blueFranchise.mainTower = null;
        this.blueFranchise.units = [];
        this.canvas.width = this.canvas.width;
    }
    addUnit(unit, side = null) {
        if (side !== null) {
            unit.side = side;
            side.units.push(unit);
        }
        this._units.push(unit);
    }
    removeUnit(unit) {
        let i = this._units.indexOf(unit);
        if (i > -1) {
            this._units.splice(i, 1);
        }
        i = unit.side.units.indexOf(unit);
        if (i > -1) {
            unit.side.units.splice(i, 1);
        }
    }
    checkIfGameIsOver() {
        if (this.redFranchise.mainTower.health <= 0) {
            this.gameIsOver = true;
            if (this.blueFranchise.mainTower.health > 0) {
                this.winner = this.redFranchise;
            }
        }
        else if (this.blueFranchise.mainTower.health <= 0) {
            this.gameIsOver = true;
            this.winner = this.blueFranchise;
        }
    }
    adjustBoard() {
        let w = document.documentElement.clientWidth;
        //let h = document.documentElement.clientHeight
        if (w >= 769) {
            w = 759;
        }
        else {
            w -= 10; // margin 5px
        }
        this.space_size = w / this.x_spaces;
        this.canvas.width = this.canvasX(this.x_spaces);
        this.canvas.height = this.canvasY(this.y_spaces);
    }
    /**
     * Renders a Unit with it's y coordinate being it's bottom edge and it's x coordinate being at it's center.
     * Does not render a health bar for unit.
     * @param unit the Unit that gets drawn on the this.canvas
     */
    renderUnit(unit) {
        let ratio = (unit.currentImage.width / unit.currentImage.height);
        let topLeftX = this.canvasX(unit.x - ratio * (unit.size * (1 / 2 + unit.y_img_margin)));
        let topLeftY = this.canvasY(unit.y - unit.size * (1 + unit.y_img_margin));
        let width = ratio * unit.size * (1 + 2 * unit.y_img_margin) * this.space_size;
        let height = this.space_size * unit.size * (1 + 2 * unit.y_img_margin);
        this.ctx.drawImage(unit.currentImage, topLeftX, topLeftY, width, height);
    }
    /**
     * Draws a health bar for a Unit on this.
     * @param unit the Unit whose health bar gets drawn on this.canvas
     */
    renderHealthBar(coord, unit) {
        let canvasX = this.canvasX(coord.x);
        let canvasY = this.canvasY(coord.y);
        let topLeftX = canvasX - unit.health_bar_width * this.space_size / 2;
        let topLeftY = canvasY - this.space_size * (unit.size + unit.health_bar_height);
        let width = unit.health_bar_width * unit.health / unit.originalHealth;
        if (width < 0) {
            width = 0;
        }
        if (width > unit.health_bar_width) {
            width = unit.health_bar_width;
        }
        width *= this.space_size;
        this.ctx.beginPath();
        this.ctx.rect(topLeftX, topLeftY, unit.health_bar_width * this.space_size, unit.health_bar_height * this.space_size);
        this.ctx.fillStyle = "hsl(0, 100%, 60%)";
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.rect(topLeftX, topLeftY, width, unit.health_bar_height * this.space_size);
        this.ctx.fillStyle = "hsl(130, 100%, 50%)";
        this.ctx.fill();
    }
    renderGreaseBarFill() {
        const fill = document.getElementById("grease-bar-fill");
        fill.style.width = `${this.blueFranchise.grease * 100 / Franchise.max_grease}%`;
    }
    canvasX(boardX) {
        return boardX * this.space_size;
    }
    canvasY(boardY) {
        return (boardY + this.y_spaces_offset) * this.space_size;
    }
    boardX(canvasX) {
        return canvasX / this.space_size;
    }
    boardY(canvasY) {
        return canvasY / this.space_size - this.y_spaces_offset;
    }
    get units() {
        return this._units;
    }
}
Board.millis_per_tick = 25;
/** A path of points on a Board for Units to travel down */
class Path {
    // Note: a path is basically an array of [x, y] pairs
    constructor(points) {
        this.points = null;
        if (points !== undefined) {
            this.points = points;
        }
    }
    point(n) {
        n = Math.round(n);
        return this.points[n];
    }
    get start() {
        return this.points[0];
    }
    get end() {
        return this.points[this.points.length - 1];
    }
}
/**
 * A game Board coordinate
 */
class XYCoord {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
}
/** One of the two sides for which Units fight. Sends it's units to destroy the main tower of the other Franchise. */
class Franchise {
    constructor(name) {
        this.mainTower = null;
        /**Includes this.mainTower */
        this.units = [];
        /**The currency/material this must have enough of to spawn a new Unit */
        this.grease = 0;
        this.grease_tick = 0;
        this.name = name;
    }
    _tick() {
        this.grease_tick++;
        if (this.grease_tick > Franchise.grease_ticks_per_sec) {
            this.grease_tick = 0;
            if (this.grease < Franchise.max_grease) {
                this.grease++;
            }
        }
    }
}
Franchise.max_grease = 12;
/**How much grease this generates every second, ie how often this.grease += 1 */
Franchise.grease_per_sec = 1;
Franchise.grease_ticks_per_sec = Franchise.grease_per_sec * 1000 / Board.millis_per_tick;
//###################### SITE FUNCTIONS ######################//
/**
 * Adds fixed html elements to the window that allow the user to select a unit a drop a new one of it on the board.
 * This method is to be called after board init but before board.startGame()
 * @param units Static units that are cloned to add new units to the board.
 */
function RenderUnitCards(units) {
    unitCardUnits = [];
    let index = 0;
    for (let unit of units) {
        const newCard = document.createElement("div");
        newCard.id = `unit-card${index}`;
        unitCardUnits.push(unit);
        newCard.className = "unit-card";
        newCard.innerHTML = `<img src="${unit.cardImage.src}">`;
        let num = index;
        newCard.onclick = (event) => { UnitCardClickEvent(event, newCard.id, num); };
        unitCardContainer.appendChild(newCard);
        index++;
    }
}
function UnitCardClickEvent(event, unitCardId, index) {
    selectedDropUnit = Object.assign({}, unitCardUnits[index]);
    selectedDropUnit.constructor = unitCardUnits[index].constructor;
    DeselectUnitCards();
    document.getElementById(unitCardId).classList.add("unit-card-selected");
    if (selectedDropUnit.constructor.name !== Spell.name) {
        board.showNoDropZone = true;
    }
}
function CanvasClickEvent(event) {
    if (selectedDropUnit != null &&
        selectedDropUnit.side.grease >= selectedDropUnit.grease_cost) {
        // calculate where the unit would be on the canvas
        let mouseBoardX = board.boardX(event.offsetX);
        let mouseBoardY = board.boardY(event.offsetY);
        if (userMayDrop(selectedDropUnit, mouseBoardX, mouseBoardY) == false) {
            return;
        }
        board.showNoDropZone = false;
        // drop it there 
        let newUnit = null;
        if (selectedDropUnit.constructor.name === Spell.name) {
            newUnit = new Spell();
        }
        else {
            newUnit = new Unit(null, selectedDropUnit.cardImage.src, selectedDropUnit.side, 1, 0, 0, selectedDropUnit.grease_cost, 1);
        }
        newUnit = Object.assign(newUnit, selectedDropUnit);
        newUnit.x = mouseBoardX;
        newUnit.y_of_center = mouseBoardY;
        newUnit.targetPosition = new XYCoord(board.redFranchise.mainTower.x, board.redFranchise.mainTower.y);
        if (newUnit.constructor.name === Unit.name) {
            newUnit.currentImage = newUnit.images.atRestImages.item(Direction.Up)[0];
        }
        board.addUnit(newUnit);
        selectedDropUnit.side.grease -= selectedDropUnit.grease_cost;
        DeselectUnitCards();
        selectedDropUnit = null;
    }
}
function userMayDrop(selectedDropUnit, boardX, boardY) {
    if (selectedDropUnit.constructor.name === Spell.name) {
        return boardY >= 0;
    }
    return boardY > (1 - board.usersPercentOfBoard / 100) * board.y_spaces;
}
function DeselectUnitCards() {
    for (let unitCard of unitCardContainer.children) {
        unitCard.classList.remove("unit-card-selected");
    }
}
function StartGame() {
    const background = new Image();
    background.src = "images/Backgrounds/Roads & grassy fields background.jpg";
    board = new Board(background);
    unitCardContainer = document.getElementById("unit-card-container");
    const RedTowerPoint = new XYCoord(board.x_spaces / 2, 10);
    const BlueTowerPoint = new XYCoord(board.x_spaces / 2, board.y_spaces - 10);
    let restaurantImages = new UnitImages(new UnitGroupItemsByDirection([""], ["images/Restaurant/Restaurant_Down1.png"], [""], [""]));
    const RedRestaurant = new Unit(restaurantImages, "images/Restaurant/Restaurant_Down1.png", board.redFranchise, 1200, RedTowerPoint.x, RedTowerPoint.y, 9, 20);
    const BlueRestaurant = new Unit(restaurantImages, "images/Restaurant/Restaurant_Down1.png", board.blueFranchise, 1200, BlueTowerPoint.x, BlueTowerPoint.y, 9, 20);
    board.redFranchise.mainTower = RedRestaurant;
    board.addUnit(RedRestaurant);
    board.blueFranchise.mainTower = BlueRestaurant;
    board.addUnit(BlueRestaurant);
    let burger = new Unit(Burger.images, Burger.cardImage.src, board.blueFranchise);
    burger = Object.assign(burger, Burger);
    burger.side = board.blueFranchise;
    let hotDog = new Unit(HotDog.images, HotDog.cardImage.src, board.blueFranchise);
    hotDog = Object.assign(hotDog, HotDog);
    hotDog.side = board.blueFranchise;
    let cheese = new Spell();
    cheese = Object.assign(cheese, Cheese);
    cheese.side = board.blueFranchise;
    let units = [burger, hotDog, cheese];
    RenderUnitCards(units);
    board.startGame();
}
