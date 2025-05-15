let xoff = 0;

function setup() {
    createCanvas(600, 400);
}

function draw() {
    background(173, 216, 230); // 浅蓝色背景
    stroke(0, 102, 204);
    strokeWeight(2);
    noFill();

    beginShape();
    for (let x = 0; x < width; x += 1) {
        let y = map(noise(xoff + x * 0.02), 0, 1, 150, 250); // 使用一维噪声生成波浪
        vertex(x, y);
    }
    endShape();

    // xoff += 0.02; // 平滑推进噪声
}
