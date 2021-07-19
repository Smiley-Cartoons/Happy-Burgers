// Board on which units live
class Board {
    constructor() {
        this.x_spaces = 100
        this.y_spaces = 100
        this.space_size = 10 // in px
        this._units = []

        this.millis_per_tick
    }

    // Kicks off game clock ticking cycle
    startGame() {
        let gameIsOver = true;
        while (!gameIsOver) {
            _tick()
        }
    }

    // Adjusts units for the current clock tick
    _tick() {
        // TODO: Position units
    }
}

// A path of points for units to travel down
class Path {
    // Note: a path is basically an array of [x, y] pairs
    constructor(points = [[0, 0], [10, 10]]) {
        this._points = []
    }
    get point(n) {
        return this._points[n]
    }
}