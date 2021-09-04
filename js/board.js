"use strict";
let board = null;
let unitCardContainer = null;
let thereIsDropUnit = false;
const dropUnitId = "drop-unit";
let unitCardUnits = [];
let selectedDropUnit = null;
// Board on which units live
class Board {
    constructor() {
        this._units = null;
        this.millis_per_tick = 25;
        this.gameIsOver = false;
        this.canvas = document.getElementById("game_board_element");
        this.ctx = this.canvas.getContext("2d");
        this.x_spaces = 100;
        this.y_spaces = 120;
        this._units = [];
        this.millis_per_tick = 25;
        this.gameIsOver = false;
    }
    // Kicks off game clock ticking cycle
    startGame() {
        setTimeout(this._tick.bind(this), this.millis_per_tick);
    }
    // Adjusts units for the current clock tick
    _tick() {
        // Resize canvas
        this.adjustBoard();
        this._units.forEach((unit, index, array) => {
            unit._tick();
            this.renderUnit(unit);
        });
        // TODO: Verify that game is not over
        if (this.gameIsOver === false) {
            setTimeout(this._tick.bind(this), this.millis_per_tick);
        }
        else {
            // TODO: Add game wrap-up code
        }
    }
    adjustBoard() {
        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;
        if (w >= 769) {
            w = 759;
        }
        else {
            w -= 10; // margin 5px
        }
        this.space_size = w / this.x_spaces;
        this.canvas.width = this.space_size * this.x_spaces;
        this.canvas.height = this.space_size * this.y_spaces;
    }
    renderUnit(unit) {
        let space_size = this.space_size;
        let ratio = (unit.currentImage.width / unit.currentImage.height) * space_size;
        let topLeftX = unit.x * space_size - ratio * unit.size / 2;
        let topLeftY = unit.y * space_size - ratio * unit.size / 2;
        let width = ratio * unit.size;
        let height = space_size * unit.size;
        this.ctx.drawImage(unit.currentImage, topLeftX, topLeftY, width, height);
        this.renderHealthBars(unit);
    }
    renderHealthBars(unit) {
        let space_size = this.space_size;
        let canvasX = unit.x * space_size;
        let canvasY = unit.y * space_size;
        let topLeftX = canvasX - unit.health_bar_width * space_size / 2;
        let topLeftY = canvasY - space_size * unit.size / 2 - unit.health_bar_height;
        let width = unit.health_bar_width * unit.health / unit.originalHealth;
        if (width < 0) {
            width = 0;
        }
        if (width > unit.health_bar_width) {
            width = unit.health_bar_width;
        }
        width *= space_size;
        this.ctx.beginPath();
        this.ctx.rect(topLeftX, topLeftY, unit.health_bar_width * space_size, unit.health_bar_height * space_size);
        this.ctx.fillStyle = "hsl(0, 100%, 60%)";
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.rect(topLeftX, topLeftY, width, unit.health_bar_height * space_size);
        this.ctx.fillStyle = "hsl(130, 100%, 50%)";
        this.ctx.fill();
    }
}
// A path of points for units to travel down
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
class XYCoord {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
}
//###################### SITE FUNCTIONS ######################//
function RenderUnitCards(units) {
    unitCardUnits = [];
    let index = 0;
    for (let unit of units) {
        const newCard = document.createElement("div");
        newCard.id = `unit-card${index}`;
        unitCardUnits.push(unit);
        newCard.className = "unit-card";
        newCard.innerHTML = `<img src="${unit.images.atRestImages.item(Direction.Down)[0].src}">`;
        let num = index;
        newCard.onclick = (event) => { UnitCardClickEvent(event, newCard.id, num); };
        unitCardContainer.appendChild(newCard);
        index++;
    }
}
function UnitCardClickEvent(event, unitCardId, index) {
    selectedDropUnit = Object.assign({}, unitCardUnits[index]);
    DeselectUnitCards();
    document.getElementById(unitCardId).classList.add("unit-card-selected");
}
function CanvasClickEvent(event) {
    if (selectedDropUnit != null) {
        // calculate where the unit would be on the canvas
        let mouseBoardX = event.offsetX / board.space_size;
        let mouseBoardY = event.offsetY / board.space_size;
        // drop it there 
        let newUnit = new Unit(selectedDropUnit.images, selectedDropUnit.side, selectedDropUnit.health, 0, 0, selectedDropUnit.size);
        newUnit = Object.assign(newUnit, selectedDropUnit);
        newUnit.x = mouseBoardX;
        newUnit.y = mouseBoardY;
        board._units.push(newUnit);
        DeselectUnitCards();
        selectedDropUnit = null;
    }
}
function DeselectUnitCards() {
    for (let unitCard of unitCardContainer.children) {
        unitCard.classList.remove("unit-card-selected");
    }
}
function StartGame() {
    board = new Board();
    board.canvas.onclick = CanvasClickEvent;
    unitCardContainer = document.getElementById("unit-card-container");
    const RedTowerPoint = new XYCoord(board.x_spaces / 2, 20);
    const BlueTowerPoint = new XYCoord(board.x_spaces / 2, board.y_spaces - 20);
    const NWPoint = new XYCoord(25, 30);
    const WPoint = new XYCoord(25, board.y_spaces / 2);
    const SWPoint = new XYCoord(25, board.y_spaces - 30);
    const NEPoint = new XYCoord(board.x_spaces - 25, 30);
    const EPoint = new XYCoord(board.x_spaces - 25, board.y_spaces / 2);
    const SEPoint = new XYCoord(board.x_spaces - 25, board.y_spaces - 30);
    const RedToBlueLeftPath = new Path([RedTowerPoint, NWPoint, WPoint, SWPoint, BlueTowerPoint]);
    const RedToBlueRightPath = new Path([RedTowerPoint, NEPoint, EPoint, SEPoint, BlueTowerPoint]);
    const BlueToRedLeftPath = new Path(RedToBlueLeftPath.points.filter(() => true).reverse());
    const BlueToRedRightPath = new Path(RedToBlueRightPath.points.filter(() => true).reverse());
    let restaurantImages = new UnitImages(new UnitGroupItemsByDirection([""], ["images/Restaurant/Restaurant-01.png"], [""], [""]));
    const RedRestaurant = new Unit(restaurantImages, "Red", 1200, RedTowerPoint.x, RedTowerPoint.y, 30);
    const BlueRestaurant = new Unit(restaurantImages, "Red", 1200, BlueTowerPoint.x, BlueTowerPoint.y, 30);
    board._units.push(RedRestaurant);
    board._units.push(BlueRestaurant);
    let images = new UnitImages(new UnitGroupItemsByDirection(["images/Burger/Burger Walking from behind-01.png"], ["images/Burger/Burger 01.png"], [""], [""]));
    let u1 = new Unit(images, "Blue", 100, 20, 40);
    let u2 = new Unit(images, "Red", 100, 40, 40, 15);
    board._units.push(u1);
    board._units.push(u2);
    let units = [...[BlueRestaurant, u1]];
    RenderUnitCards(units);
    board.startGame();
}
