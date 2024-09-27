let graph;
let canvas;
let scale_controller;

let parameters = {
    bright: 0.75,
    scale: 0.5,
    size: 0.6,
    space: 0.5,
    number_on: true,
    revert: true,
    color: 0,
    pixel_density: 1,
    speed: 0.1,
    style: "force",
    text: "(1 ,2), (1, 3), (2,4), (3,4),(1,5), (2,3)",
    save_button: save_image,
    render: process_input,
    random_button: random_position,
};

function setup() {
    let gui = new dat.GUI();
    let control_folder = gui.addFolder('control');
    let vis_folder = gui.addFolder('vis');
    let text_folder = gui.addFolder('input');
    let save_folder = gui.addFolder('save');

    control_folder.add(parameters, 'speed', 0, 1).name('speed');
    control_folder.add(parameters, 'bright', 0, 1).name('bright');
    scale_controller = control_folder.add(parameters, 'scale', 0, 1).name('scale');
    control_folder.add(parameters, 'size', 0, 1).name('size');
    control_folder.add(parameters, 'space', 0, 1).name('space');
    control_folder.add(parameters, 'number_on').name('number');
    control_folder.add(parameters, 'style', ["force"]).name('style');
    control_folder.add(parameters, 'random_button').name('random');

    vis_folder.add(parameters, 'color', 0, 1).name('color');
    vis_folder.add(parameters, 'revert').name('revert');
    vis_folder.add(parameters, 'pixel_density', 1, 3).name('pixel density');

    text_folder.add(parameters, "text").name('graph');
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

function process_input() {
    let alls = parameters.text;
    let matches = alls.match(/\(.*?,.*?\)/g);
    let m = matches.length;
    let map = new Map();
    let tot = 0;
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
    let n = tot;
    let edges = new Array(n);
    for (let i = 0; i < n; i++) {
        edges[i] = [];
    }
    for (let [x, y] of arr) {
        if (x == y || edges[x].indexOf(y) != -1)
            continue;
        edges[y].push(x);
        edges[x].push(y);
    }
    let rev = new Array(n);
    for (let [key, value] of map) {
        rev[value] = key;
    }
    graph = new ForceDirectedGraph({
        'n': n,
        'edges': edges,
        'symbol': rev
    });
}

function mouseWheel(event) {
    //move the square according to the vertical scroll amount
    let scale_val = parameters.scale;
    scale_val += event.delta / 2500;
    scale_val = max(scale_val, 0);
    scale_val = min(scale_val, 1);
    parameters.scale = scale_val;
    scale_controller.updateDisplay();
}

let preX, preY;
let drag_node = -1;

function mousePressed() {
    preX = mouseX;
    preY = mouseY;
    drag_node = graph.locate_node(preX, preY);
}

function mouseReleased() {
    drag_node = -1;
    graph.set_drag_node(drag_node);
}

function mouseDragged(event) {
    if (preX >= 0 && preX <= width && preY >= 0 && preY <= height) {
        graph.set_drag_node(drag_node);
        if (drag_node == -1) {
            graph.add_bias(mouseX - preX, mouseY - preY);
        } else {
            graph.pull(mouseX, mouseY, mouseX - preX, mouseY - preY);
        }
        preX = mouseX;
        preY = mouseY;
    }
}

function save_image() {
    saveCanvas(drawing, 'graph', 'jpg');
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
    graph.set_drawing(drawing);
    graph.set_stroke_color(stroke_color);
    graph.set_delta(parameters.speed);
    graph.set_bright(map(parameters.bright, 0, 1, 50, 255));
    graph.set_size(map(parameters.size, 0, 1, 0.5, 100));
    graph.set_ratio(map(parameters.space, 0, 1, 1, 50));
    graph.set_number_on(parameters.number_on);
    graph.set_scale_val(map(parameters.scale, 0, 1, 0.1, 4));
    graph.move();
    let ok = graph.show();
    if (!ok) {
        alert('Oops, two particles collided!');
        graph.init_pos();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    drawing = createGraphics(windowWidth, windowHeight);
    drawing.clear();
}

function random_position() {
    graph.init_pos();
}
