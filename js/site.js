// JavaScript source code for doing stuff with the webpage(s)

class Unit {
    constructor(health, x, y) {
        this.originalHealth = health
        this.health = health
        this.x = x
        this.y = y
        this.size = 150

        this.health_bar_width = 60
        this.health_bar_height = 12

        this.image = new Image()
        this.image.src = "images/Burger/Burger 01.png"
    }

    renderHealthBar(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.rect(this.x-this.health_bar_width/2, this.y-this.size/2-this.health_bar_height, this.health_bar_width, this.health_bar_height);  
        ctx.fillStyle = "red";  
        ctx.fill();

        ctx.beginPath();
        ctx.rect(this.x-this.health_bar_width/2, this.y-this.size/2-this.health_bar_height, this.health_bar_width*this.health/this.originalHealth, this.health_bar_height);  
        ctx.fillStyle = "green";  
        ctx.fill();
    }

    renderSelf(canvas) {
        let ctx = canvas.getContext("2d");
        let ratio = this.image.width/this.image.height
        ctx.drawImage(this.image,this.x-ratio*this.size/2, this.y-this.size/2, ratio*this.size, this.size);
                
    }
}