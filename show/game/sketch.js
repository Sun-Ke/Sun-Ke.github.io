let w, h, r, cnt = 0, v, times = 0, wr, hr, gap;//inside
let beta = 24, length, d, frq;//outside
let colr, colb, colg;
let broad, extend = 0, flag = 0;
let score = 0, end = 0, maximum = 10000;
function setup() {
    createCanvas(windowWidth, windowHeight); //1580, 770
    w = width, h = height, r = 15;
    wr = 20, hr = 40;//rect
    length = w / 2;
    gap = 3, frq = 25;//发射频率
    v = 10, d = 2;//小球速度
    bmx = w / 2, bmy = h / 2, bmr = 20, step = 5;
    broad = 24;//bomb's width
    for (let i = 0; i <= broad + 5; i++) {
        c[i] = [];
        sett[i] = [];
    }
    textSize(30);
}
let x = [], y = [], vx = [], vy = [];//inner
let xx = [], yy = [], dx = [], dy = [], exist = [];//outer
let c = [], pos = [], sett = [];
let bmx, bmy, bmr, step;
function Fill(x1, x2, x3, ratio) {
    c[1].push(x1);
    c[2].push(x2);
    c[3].push(x3);
    pos.push(ratio);
}
function Init() {
    background(220);
    fill(0);
    circle(w / 2, h / 2, r * 3);
    let alpha = atan2(mouseY - h / 2, mouseX - w / 2) + PI / 2;
    push();
    translate(w / 2, h / 2)
    rotate(alpha);
    rect(-wr / 2, -hr / 2 - r, wr, hr);
    pop();

    Fill(0, 0, 0, broad);
    //暗红色
    Fill(178, 34, 34, 5 / 8 * broad);
    //橙红色
    Fill(220, 122, 0, 4 / 8 * broad);
    //亮黄色
    Fill(220, 213, 71, 2 / 8 * broad);
    //灰色
    Fill(220, 220, 220, 1 / 8 * broad);
    Fill(220, 220, 220, 0);
}
function Generate() {
    ++times;
    if (times % gap == 0) {
        let tx = mouseX - w / 2, ty = mouseY - h / 2;
        x.push(w / 2), y.push(h / 2);
        let sum = sqrt(tx * tx + ty * ty);
        vx.push((tx / sum) * v), vy.push((ty / sum) * v);
        ++cnt;//ball(in)
    }
    if (times % frq == 0) {
        let tmp = random(0, PI / 4);
        if (beta < 50) {
            beta = ceil(map(score, 0, maximum, 24, 50));
        }
        for (let i = 0; i < beta; i++) {
            let arc = PI * 2 / beta * i;
            let ix = w / 2 - length * cos(arc + tmp), iy = h / 2 - length * sin(arc + tmp);
            xx.push(ix);
            yy.push(iy);
            let tx = w / 2 - ix, ty = h / 2 - iy;
            let sum = sqrt(tx * tx + ty * ty);
            dx.push((tx / sum) * d), dy.push((ty / sum) * d);
            exist.push(1);
        }
        if (frq > 15) {
            frq = floor(map(score, 0, maximum, 25, 15));
        }//ball(out)
    }
}
function Check(i) {
    for (let j = 0; j < xx.length; j++) {
        let dis = dist(x[i], y[i], xx[j], yy[j]);
        Outdelete(dis, j, 0);
    }
    Indelete(i);
}
function Indelete(i) {
    if (x[i] - r < 0 || x[i] + r > w || y[i] - r < 0 || y[i] + r > h) {
        x.splice(i, 1);
        y.splice(i, 1);
        vx.splice(i, 1);
        vy.splice(i, 1);
    }//beyond check
}
function Outdelete(dis, j, flag) {
    if (dis <= r + r || flag == 1) {
        xx.splice(j, 1);
        yy.splice(j, 1);
        dx.splice(j, 1);
        dy.splice(j, 1);
        score++;
    }//crash check
}
function Indraw() {
    for (let i = 0; i < x.length; i++) {
        Check(i);
        x[i] += vx[i], y[i] += vy[i];
        fill(256);
        circle(x[i], y[i], r * 1.5);
    }
}
function Outdraw() {
    for (let i = 0; i < xx.length; i++) {
        let dis = dist(xx[i], yy[i], bmx, bmy);
        if (flag == 1 && dis <= r + bmr * 4) {
            Outdelete(0, i, 1);
            continue;//judge
        }
        dis = dist(xx[i], yy[i], w / 2, h / 2);
        let lmax = sqrt((w * w + h * h) / 4);
        colr = map(dis, 0, lmax, 256, 0);
        colb = colg = map(dis, 0, lmax, 0, 256);
        xx[i] += dx[i], yy[i] += dy[i];
        fill(colr, colb, colg);
        circle(xx[i], yy[i], r);
        Judge(i);
    }
}
function Judge(i) {
    let dis = dist(xx[i], yy[i], w / 2, h / 2);
    if (dis < r * 4) {
        end = 1;
    }
}
function Bomb() {
    if (extend != 0) Launch();
    if (keyIsPressed) {
        if (keyCode === 87) bmy -= step;//w
        if (keyCode === 65) bmx -= step;//a
        if (keyCode === 83) bmy += step;//s
        if (keyCode === 68) bmx += step;//d
        if (keyCode === 70) Launch();//f
    }
    strokeWeight(3);
    line(bmx - bmr, bmy, bmx + bmr, bmy);
    line(bmx, bmy - bmr, bmx, bmy + bmr);
    strokeWeight(1);
}
function Color(x, y, r) {
    if (extend == 0) {
        let cnt = 0;
        for (let i = broad; i >= 0; i--) {
            for (let j = 1; j <= 3; j++) {
                if (pos[cnt + 1] - i == 0) cnt++;
                sett[i][j] = map(pos[cnt] - i, 0, pos[cnt] - pos[cnt + 1], c[j][cnt], c[j][cnt + 1]);
            }
            fill(sett[i][1], sett[i][2], sett[i][3]);
            strokeWeight(0);
            ellipse(x, y, r * i / broad, r * i / broad);
            strokeWeight(1);
        }
    }
    else {
        let ext = ceil(extend);
        for (let i = broad - ext; i >= 0; i--) {
            let ori = i + ext;
            fill(sett[i][1], sett[i][2], sett[i][3]);
            strokeWeight(0);
            ellipse(x, y, r * ori / broad, r * ori / broad);
            strokeWeight(1);
        }
    }
    flag = 1;
    extend += 0.2;
    if (extend > broad) {
        flag = 0;
        extend = 0;
    }
}
function Launch() {
    Color(bmx, bmy, bmr * 8);
}
function DouBao() {
    let purple = color(220, 220, 240);
    let white = color(255, 255, 255);
    for (let i = 0; i < h; i++) {
        let inter = map(i, 0, h, 0, 1);
        let col = lerpColor(purple, white, inter); //在淡紫色和白色之间进行线性插值
        stroke(col);
        line(0, i, w, i);
    }
}
function Ending() {
    background(0);
    textSize(50);
    DouBao();
    textAlign(CENTER, CENTER);
    fill(128, 0, 128);
    /*let fir=random(0,256), sec=random(0,256), thi=random(0,256);
    fill(fir, sec, thi);*/
    text("Your Score: ", w / 2, h / 2);
    text(score, w / 2 + 190, h / 2);
}
function draw() {
    if (end == 1) {
        Ending();
    }
    else {
        Init();
        Generate();
        Bomb();
        Indraw();
        Outdraw();
        fill(0);
        text("Score: ", 10, 30);
        text(score, 100, 30);
    }
}