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

    // To be added as an event listener to the window.
    boardOnWindowResize() {
        let board = globalBoard // this works if a global Board is defigned. // TODO: fix this janky code
        // Get width and height of the window excluding scrollbars
        let w = document.documentElement.clientWidth;
        let h = document.documentElement.clientHeight;

        let boardRatio = board.x_spaces / board.y_spaces
        let windowRatio = w / h
        if (boardRatio > windowRatio) {
            // window is narrower than board
            board.space_size = h / board.y_spaces
        } else {
            // window is stretched more than board
            board.space_size = w / board.x_spaces
        }
        let canvas = document.getElementById("game_board_element")
        canvas.width = board.space_size * board.x_spaces
        canvas.height = board.space_size * board.y_spaces
    }
}

// A path of points for units to travel down
class Path {
    // Note: a path is basically an array of [x, y] pairs
    constructor(points = [[0, 0], [10, 10]]) {
        this._points = points
    }
    point(n) {
        return this._points[n]
    }
}