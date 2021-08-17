// Board on which units live
const Board = {
    init: function () {
        Board.canvas = document.getElementById("game_board_element");
        Board.ctx = Board.canvas.getContext("2d");
        Board.x_spaces = 100;
        Board.y_spaces = 120;
        Board._units = [];
        Board.millis_per_tick = 25;
        Board.gameIsOver = false;
    },
    canvas: undefined,
    ctx: undefined,
    x_spaces: undefined,
    y_spaces: undefined,
    space_size: undefined,
    _units: [],
    millis_per_tick: 25,
    gameIsOver: false,
    // Kicks off game clock ticking cycle
    startGame: function () {
        setTimeout(Board._tick, Board.millis_per_tick);
    },
    // Adjusts units for the current clock tick
    _tick: function () {
        // Resize canvas
        Board.adjustBoard();
        Board._units.forEach((unit, index, array) => {
            unit._tick();
            Board.renderUnit(unit);
        });
        // TODO: Verify that game is not over
        if (Board.gameIsOver === false) {
            setTimeout(Board._tick, Board.millis_per_tick);
        }
        else {
            // TODO: Add game wrap-up code
        }
    },
    adjustBoard: function () {
        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;
        if (w >= 769) {
            w = 759;
        }
        else {
            w -= 10; // margin 5px
        }
        Board.space_size = w / Board.x_spaces;
        Board.canvas.width = Board.space_size * Board.x_spaces;
        Board.canvas.height = Board.space_size * Board.y_spaces;
    },
    renderUnit: function (unit) {
        let space_size = Board.space_size;
        let ratio = (unit.image.width / unit.image.height) * space_size;
        let topLeftX = unit.x * space_size - ratio * unit.size / 2;
        let topLeftY = unit.y * space_size - ratio * unit.size / 2;
        let width = ratio * unit.size;
        let height = space_size * unit.size;
        Board.ctx.drawImage(unit.image, topLeftX, topLeftY, width, height);
        Board.renderHealthBars(unit);
    },
    renderHealthBars: function (unit) {
        let space_size = Board.space_size;
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
        Board.ctx.beginPath();
        Board.ctx.rect(topLeftX, topLeftY, unit.health_bar_width * space_size, unit.health_bar_height * space_size);
        Board.ctx.fillStyle = "red";
        Board.ctx.fill();
        Board.ctx.beginPath();
        Board.ctx.rect(topLeftX, topLeftY, width, unit.health_bar_height * space_size);
        Board.ctx.fillStyle = "green";
        Board.ctx.fill();
    }
};
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
