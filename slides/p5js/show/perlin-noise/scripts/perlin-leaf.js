let xoff = 0;

function setup() {
    createCanvas(600, 400);
}

function draw() {
    background(255);

    for (let i = 0; i < 10; i++) {
        let offset = xoff + i * 0.2;
        let angle = map(noise(offset), 0, 1, -PI / 6, PI / 6);
        let x = 100 + i * 50;
        let y = height / 2;

        push();
        translate(x, y);
        rotate(angle);
        fill(34, 139, 34);
        ellipse(0, 0, 20, 60); // 树叶形状
        pop();
    }

    xoff += 0.01;
}
