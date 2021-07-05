// Board on which units live
class Board {
    constructor() {
        this.x_spaces = 100
        this.y_spaces = 100
        this.space_size = 10 // in px
        this._units = []
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