let bubbles = []
function preload() {
    // 可以留空，或者加载一些资源
}
function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
}
let cnt = 0;
function draw() {
    background(255);
    fill(255);
    text(bubbles.length, 10, 20);
    if (true) { // mouseIsPressed
        for (let i = 0; i < 3; i++) {
            bubbles.push(new Bubble(width / 2, height / 2));
        }
    }
    for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].move();
        bubbles[i].show();
    }
    for (let i = 0; i < bubbles.length; i++) {
        if (bubbles[i].out_of_screen()) {
            bubbles.splice(i, 1);
            i--;
        }
    }
}

class Bubble {
    constructor(x, y) {
        cnt += 1;
        this.x = x;
        this.y = y;
        this.xSpeed = random(-3, 3);
        this.ySpeed = random(-3, 3);
        this.r = random(1, 8);
        this.color = color(random(255), random(255), random(255), random(100, 255));
    }
    move() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }
    show() {
        fill(this.color);
        circle(this.x, this.y, this.r * 2);
    }
    out_of_screen() {
        return this.x + this.r < 0 || this.x - this.r > width || this.y + this.r < 0 || this.y - this.r > height;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight); // 窗口改变时，调整画布大小
}
function keyPressed() {
    if (key === 's' || key === 'S') {  // 检测是否按下 's' 或 'S'
        if (isLooping()) {
            noLoop(); // 暂停动画
        } else {
            loop();   // 恢复动画
        }
    }
}
function mouseClicked() {
    if (isLooping()) {
        noLoop(); // 暂停动画
    } else {
        loop();   // 恢复动画
    }
}