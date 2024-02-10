let canvas, drawing;
let number_dx = 0, number_dy = 0;

function Tree(root, edges, map, rev) {
    this.root = root;
    this.edges = edges;
    this.map = map;
    this.rev = rev;
};
let tree;

let parameters = {
    scale: 0.6,
    size: 0.4,
    space: 0.4,
    value: 42,
    number_on: true,
    revert: true,
    color: 0,
    pixel_density: 1,
    style: "layered",
    root: "3",
    text: "(1 ,2), (1, 3), (2,4), (2,5), (3,6)",
    save_button: save_image,
    render: process_input,
};

function setup() {
    let gui = new dat.GUI();
    let control_folder = gui.addFolder('control');
    let vis_folder = gui.addFolder('vis');
    let text_folder = gui.addFolder('input');
    let save_folder = gui.addFolder('save');
    control_folder.add(parameters, 'scale', 0, 1).name('scale');
    control_folder.add(parameters, 'size', 0, 1).name('size');
    control_folder.add(parameters, 'space', 0, 1).name('space');
    control_folder.add(parameters, 'number_on').name('number');

    control_folder.add(parameters, 'style', ["layered", "radial"]).name('style');

    vis_folder.add(parameters, 'color', 0, 1).name('color');
    vis_folder.add(parameters, 'revert').name('revert');
    vis_folder.add(parameters, 'pixel_density', 1, 3).name('pixel density');

    text_folder.add(parameters, "root").name('root');
    text_folder.add(parameters, "text").name('tree');
    text_folder.add(parameters, "render").name('render');

    save_folder.add(parameters, 'save_button').name('save as jpg');


    control_folder.open();
    vis_folder.open();
    text_folder.open();
    save_folder.open();

    canvas = createCanvas(windowWidth, windowHeight)
    canvas.style('display', 'block')
    canvas.parent('sketch');

    drawing = createGraphics(windowWidth, windowHeight);
    drawing.clear();

    process_input();
}

// function keyPressed() {
//     if (keyCode === LEFT_ARROW) {
//         number_dx -= 0.2;
//     } else if (keyCode === RIGHT_ARROW) {
//         number_dx += 0.2;
//     } else if (keyCode === UP_ARROW) {
//         number_dy -= 0.2;
//     } else if (keyCode === DOWN_ARROW) {
//         number_dy += 0.2;
//     }
// }

function process_input() {
    let alls = parameters.text;
    let matches = alls.match(/\(.*?,.*?\)/g);
    let n = matches.length + 1;
    let root = parameters.root;
    let map = new Map();
    let tot = 0;
    map.set(root, tot++);
    let arr = [];
    for (let ele of matches) {
        let pair = ele.slice(1, ele.length - 1);
        let line = pair.split(",");
        if (2 != line.length) {
            alert('input error!');
            return;
        }
        let x = line[0].trim();
        let y = line[1].trim();
        if (!map.has(x)) {
            map.set(x, tot++);
        }
        if (!map.has(y)) {
            map.set(y, tot++);
        }
        arr.push([map.get(x), map.get(y)]);
    }
    if (tot != n) {
        alert('input error!');
        return;
    }
    let fa = new Array(n);
    for (let i = 0; i < n; i++) {
        fa[i] = i;
    }
    function getfa(x) {
        if (x == fa[x]) return x;
        fa[x] = getfa(fa[x])
        return fa[x];
    }
    function merge(x, y) {
        x = getfa(x);
        y = getfa(y);
        if (x == y) {
            return false;
        }
        fa[x] = y;
        return true;
    }

    for (let [x, y] of arr) {
        if (!merge(x, y)) {
            alert('input error!');
            return;
        }
    }

    edges = new Array(n);
    for (let i = 0; i < n; i++) {
        edges[i] = [];
    }
    for (let [x, y] of arr) {
        edges[y].push(x);
        edges[x].push(y);
    }
    rev = new Array(n);
    for (let [key, value] of map) {
        rev[value] = key;
    }
    tree = new Tree(root, edges, map, rev);
}

function save_image() {
    saveCanvas(drawing, 'tree', 'jpg');
}

function draw() {
    drawing.pixelDensity(parameters.pixel_density);
    let color = map(parameters.color, 0, 1, 0, 255);
    let background_color = color;
    let stroke_color = 255;
    if (parameters.revert) {
        [background_color, stroke_color] = [stroke_color, background_color];
    }
    drawing.background(background_color);
    let style_type = parameters.style;
    let space = map(parameters.space, 0, 1, 0, 100);
    let scale = map(parameters.scale, 0, 1, 50, max(windowWidth, windowHeight));
    let size = map(parameters.size, 0, 1, 20, 150);
    let number_on = parameters.number_on;
    let vis_tree;
    switch (style_type) {
        case "radial":
            vis_tree = new RadialTree(tree.edges, map(space, 0, 100, 0, 2 * Math.PI));
            break;
        case "layered":
            vis_tree = new LayeredTree(tree.edges, map(space, 0, 100, 0.2, 3.5), map(size, 10, 80, 0.05, 2.5));
            break;
        default:
            alert("undefined");
    }
    let pos = [...vis_tree.getPos()];
    let n = tree.edges.length;
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) {
        cx += pos[i].x;
        cy += pos[i].y;
    }
    cx /= n;
    cy /= n;
    let x_min = Infinity, x_max = -Infinity, y_min = Infinity, y_max = -Infinity;
    for (let i = 0; i < n; i++) {
        pos[i].x -= cx;
        pos[i].y -= cy;
        x_min = min(x_min, pos[i].x);
        x_max = max(x_max, pos[i].x);
        y_min = min(y_min, pos[i].y);
        y_max = max(y_max, pos[i].y);
    }
    let ylen = y_max - y_min + x_max - x_min;
    for (let i = 0; i < n; i++) {
        drawing.stroke(stroke_color);
        drawing.strokeWeight(3);
        drawing.noFill();
        pos[i].x = ((x_max - x_min > 0.001) ? map(pos[i].x, x_min, x_max, x_min / ylen * scale, x_max / ylen * scale) : pos[i].x) + width / 2;
        pos[i].y = ((y_max - y_min > 0.001) ? map(pos[i].y, y_min, y_max, y_min / ylen * scale, y_max / ylen * scale) : pos[i].y) + height / 2 + height / 12;
        drawing.circle(pos[i].x, pos[i].y, size);
        if (number_on) {
            drawing.textAlign(CENTER, CENTER);
            drawing.textSize(size / 5 * 3);
            drawing.noStroke();
            drawing.fill(stroke_color);
            drawing.text(tree.rev[i], pos[i].x - 0.5 + number_dx, pos[i].y + 2.5 + number_dy);
        }
    }
    for (let i = 0; i < n; i++) {
        for (let j of tree.edges[i]) {
            let vx = pos[j].x - pos[i].x;
            let vy = pos[j].y - pos[i].y;
            let vlen = Math.sqrt(vx ** 2 + vy ** 2);
            if (vlen < size)
                continue;
            vx /= vlen;
            vy /= vlen;
            drawing.stroke(stroke_color);
            drawing.strokeWeight(3);
            drawing.line(pos[i].x + vx * (size / 2 + 10),
                pos[i].y + vy * (size / 2 + 10),
                pos[j].x - vx * (size / 2 + 10),
                pos[j].y - vy * (size / 2 + 10),
            )
        }
    }
    image(drawing, 0, 0);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    drawing = createGraphics(windowWidth, windowHeight);
    drawing.clear();
}