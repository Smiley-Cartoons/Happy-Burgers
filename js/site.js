// JavaScript source code for doing stuff with the webpage(s)

class Unit {
    constructor(image, health, x, y, size = 10) {
        this.originalHealth = health
        this.health = health
        this.x = x
        this.y = y
        this.size = size

        this.health_bar_width = 12
        this.health_bar_height = 2

        this.image = new Image()
        this.image.src = image
    }

    _tick() {
        // TODO: cycle through animation pics
        // todo: remove example code
        this.health -= 1
        if (this.health < -20) {
            this.health = 150
        }
        this.x += 0.2
        if (this.x > Board.x_spaces) {
            this.x = -10
        }
        this.y += 0.3
        if (this.y > Board.y_spaces) {
            this.y = -10
        }
    }
}