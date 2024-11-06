let canvas, drawing;
let number_dx = 0, number_dy = 0;
let gui;
let inputBox;
let input_box_width = 270;
let input_box_height = 500;
let isMouseOverTextarea = false;
let border = 5;

const input_example = `6 1
1 2
1 3
2 4
2 5
3 6
`

function Tree(root, edges, map, rev) {
    this.root = root;
    this.edges = edges;
    this.map = map;
    this.rev = rev;
};
let tree, radial_tree, layered_tree;

let parameters = {
    scale: 0.6,
    size: 0.4,
    space: 0.4,
    value: 42,
    number_on: true,
    revert: true,
    color: 0,
    pixel_density: 2,
    style: "layered",
    save_button: save_image,
    render: process_input,
};

function setup() {
    gui = new dat.GUI();
    let control_folder = gui.addFolder('control');
    let vis_folder = gui.addFolder('vis');
    let text_folder = gui.addFolder('input');
    let save_folder = gui.addFolder('save');
    control_folder.add(parameters, 'scale', 0, 1).name('scale');
    control_folder.add(parameters, 'size', 0, 1).name('size').onChange(function (size) {
        if (parameters.style === "radial") {
            //pass
        } else if (parameters.style === "layered") {
            layered_tree.update_size(map(size, 0, 1, 0.05, 5));
        }
    });
    control_folder.add(parameters, 'space', 0, 1).name('space').onChange(function (space) {
        print("space")
        if (parameters.style === "radial") {
            radial_tree.update_scope(map(space, 0, 1, 0, 2 * Math.PI));
        } else if (parameters.style === "layered") {
            layered_tree.update_space(map(space, 0, 1, 0.2, 3.5));
        }
    });
    control_folder.add(parameters, 'number_on').name('number');
    control_folder.add(parameters, 'style', ["layered", "radial"]).name('style');

    vis_folder.add(parameters, 'color', 0, 1).name('color');
    vis_folder.add(parameters, 'revert').name('revert').onFinishChange(function (value) {
        if (!parameters.revert) {
            inputBox.style('background-color', '#333');    // 深色背景
            inputBox.style('border', '2px solid #555');    // 灰色边框
            inputBox.style('color', '#fff');               // 白色字体
        } else {
            inputBox.style('background-color', '#f0f8ff'); // 浅蓝色背景
            inputBox.style('border', '2px solid #4682b4'); // 蓝色边框
            inputBox.style('color', '#333');               // 文字颜色
        }
    });
    vis_folder.add(parameters, 'pixel_density', 1, 3).name('pixel density');

    text_folder.add(parameters, "render").name('render (ctrl + s)');

    save_folder.add(parameters, 'save_button').name('save as jpg');


    control_folder.open();
    vis_folder.open();
    text_folder.open();
    save_folder.open();

    canvas = createCanvas(window.innerWidth - border, window.innerHeight - border)
    canvas.style('display', 'block')
    canvas.parent('sketch');

    drawing = createGraphics(window.innerWidth - border, window.innerHeight - border);
    drawing.clear();

    inputBox = createElement('textarea', input_example);
    input_box_height = min(drawing.height / 2, drawing.height - gui.domElement.clientHeight - 50);
    input_box_width = gui.domElement.clientWidth - 15;
    inputBox.size(input_box_width, input_box_height);
    inputBox.position(drawing.width - input_box_width - 25, drawing.height - input_box_height - 25);
    // 应用自定义样式
    inputBox.style('background-color', '#f0f8ff'); // 浅蓝色背景
    inputBox.style('border', '2px solid #4682b4'); // 蓝色边框
    inputBox.style('padding', '10px');             // 内边距
    inputBox.style('font-size', '24px');           // 字体大小
    inputBox.style('font-family', 'Consolas');
    inputBox.style('border-radius', '10px');       // 圆角边框
    inputBox.style('color', '#333');               // 文字颜色
    inputBox.style('line-height', '1.5');          // 行间距
    // 设置样式以固定位置到右下角
    inputBox.style('position', 'fixed');
    inputBox.style('right', '0px');
    inputBox.style('bottom', '0px');
    // 添加 mouseover 和 mouseout 事件监听器
    inputBox.mouseOver(() => {
        isMouseOverTextarea = true;
    });
    inputBox.mouseOut(() => {
        isMouseOverTextarea = false;
    });
    read_textarea();
    radial_tree = new RadialTree(tree.edges, map(parameters.space, 0, 1, 0, 2 * Math.PI));
    layered_tree = new LayeredTree(tree.edges, map(parameters.space, 0, 1, 0.2, 3.5), map(parameters.size, 0, 1, 0.05, 2.5));

    drawing.textFont('Comic Sans MS');
}


function read_textarea() {
    let alls = inputBox.value();
    let lines = alls.trim().split('\n');
    let [n, root] = lines[0].split(/\s+/);
    n = Number(n);
    let map = new Map();
    let tot = 0;
    map.set(root, tot++);
    let arr = [];
    for (let i = 1; i < lines.length; i++) {
        let [x, y] = lines[i].trim().split(/\s+/);
        if (x === undefined || y === undefined) {
            throw new Error(`第${i}行输入的边有误!`);
        }
        if (!map.has(x)) {
            map.set(x, tot++);
        }
        if (!map.has(y)) {
            map.set(y, tot++);
        }
        arr.push([map.get(x), map.get(y)]);
    }
    if (tot != n) {
        throw new Error(`输入的点数有误!`);
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
            throw new Error(`输入存在环路!`);
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

function process_input() {
    try {
        read_textarea();
        if (parameters.style === "radial") {
            radial_tree.update_edges(tree.edges);
        } else if (parameters.style === "layered") {
            layered_tree.update_edges(tree.edges);
        }
    } catch (error) {
        alert(error.message);
    }
}


function save_image() {
    saveCanvas(drawing, 'tree', 'jpg');
}

function mouseWheel(event) {
    if (isMouseOverTextarea) {
        return;
    }
    let scale_val = parameters.scale;
    scale_val -= event.delta / 2500;
    scale_val = max(scale_val, 0);
    scale_val = min(scale_val, 1);
    parameters.scale = scale_val;
    gui.updateDisplay();
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
    let vis_tree;
    if (style_type === "radial") {
        vis_tree = radial_tree;
    } else if (style_type === "layered") {
        vis_tree = layered_tree;
    }
    let pos = vis_tree.get_pos();
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
    drawing.stroke(stroke_color);
    drawing.strokeWeight(3);
    drawing.noFill();
    for (let i = 0; i < n; i++) {
        pos[i].x = ((x_max - x_min > 0.001) ? map(pos[i].x, x_min, x_max, x_min / ylen * scale, x_max / ylen * scale) : pos[i].x) + width / 2;
        pos[i].y = ((y_max - y_min > 0.001) ? map(pos[i].y, y_min, y_max, y_min / ylen * scale, y_max / ylen * scale) : pos[i].y) + height / 2 + height / 12;
        drawing.circle(pos[i].x, pos[i].y, size);
    }
    if (parameters.number_on) {
        drawing.textAlign(CENTER, CENTER);
        drawing.textSize(size / 5 * 3);
        drawing.noStroke();
        drawing.fill(stroke_color);
        for (let i = 0; i < n; i++) {
            drawing.text(tree.rev[i], pos[i].x + number_dx, pos[i].y + 2.5 + number_dy);
        }
    }
    drawing.stroke(stroke_color);
    drawing.strokeWeight(3);
    for (let i = 0; i < n; i++) {
        for (let j of tree.edges[i]) {
            let vx = pos[j].x - pos[i].x;
            let vy = pos[j].y - pos[i].y;
            let vlen = Math.sqrt(vx ** 2 + vy ** 2);
            if (vlen < size)
                continue;
            vx /= vlen;
            vy /= vlen;
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
    resizeCanvas(window.innerWidth - border, window.innerHeight - border);
    drawing = createGraphics(window.innerWidth - border, window.innerHeight - border);
    drawing.clear();

    input_box_height = min(drawing.height / 2, drawing.height - gui.domElement.clientHeight - 50);
    input_box_width = gui.domElement.clientWidth - 15;
    inputBox.size(input_box_width, input_box_height);
    inputBox.position(drawing.width - input_box_width - 25, drawing.height - input_box_height - 25);

}

document.addEventListener('keydown', function (event) {
    // 检查是否按下了 Ctrl + S 或 Cmd + S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // 阻止默认的保存页面行为
        process_input();
    }
});
