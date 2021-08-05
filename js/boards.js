// Board on which units live
Board = {
    init: function() {
        Board.canvas = document.getElementById("game_board_element")
        Board.x_spaces = 100
        Board.y_spaces = 50
        Board.space_size = 10 // in px
        Board._units = []

        Board.millis_per_tick = 25

        Board.gameIsOver = false
    },
    canvas: undefined,
    x_spaces: undefined,
    y_spaces: undefined,
    space_size: undefined, // in px
    _units: [],
    millis_per_tick: 25,
    gameIsOver: false,

    // Kicks off game clock ticking cycle
    startGame: function() {
        setTimeout(Board._tick, Board.millis_per_tick)
    },

    // Adjusts units for the current clock tick
    _tick: function() {
        // Resize canvas
        Board.adjustBoard()

        Board._units.forEach((currentItem, index, array) => {
            currentItem.renderSelf(Board.canvas)
            currentItem.renderHealthBar(Board.canvas)
        })
        
        // TODO: Verify that game is not over
        if (Board.gameIsOver === false) {
            setTimeout(Board._tick, Board.millis_per_tick)
        } else {
            // TODO: Add game wrap-up code
        }
    },

    adjustBoard: function() {
        let w = document.documentElement.clientWidth * 0.8; // margin 10% both sides
        let h = document.documentElement.clientHeight * 0.8;

        Board.space_size = w / Board.x_spaces

        Board.canvas.width = Board.space_size * Board.x_spaces
        Board.canvas.height = Board.space_size * Board.y_spaces
    },

    // DEPRECIATED. // To be added as an event listener to the window.
    boardOnWindowResize() {
        let board = globalBoard // Board works if a global Board is defigned. // TODO: fix Board janky code
        // Get width and height of the window excluding scrollbars
        let w = document.documentElement.clientWidth*0.9; // margin 5% both sides
        let h = document.documentElement.clientHeight-15; // margin 15px bottom

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