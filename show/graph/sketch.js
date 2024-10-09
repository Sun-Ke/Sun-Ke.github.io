let graph;
let canvas;
let scale_controller;
let gui;
let isMouseOverGUI = false;
let isMouseOverTextarea = false;
let border = 5;

let input_box_width = 270;
let input_box_height = 500;
let inputBox;
// let typingTimer; // 定时器
// let doneTypingInterval = 5000; // 停止输入后的等待时间 (毫秒)


const input_example = `5 6
1 2
1 3
2 4
3 4
1 5
2 3
`

let parameters = {
    bright: 0.75,
    scale: 0.8,
    size: 0.6,
    space: 0.5,
    number_on: true,
    revert: true,
    color: 0,
    pixel_density: 2,
    speed: 0.4,
    style: "force",
    save_button: save_image,
    render: process_input,
    random_button: random_position,
};

function setup() {
    gui = new dat.GUI();
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

    // 检测鼠标是否在 GUI 面板上
    let guiContainer = document.querySelector('.dg.main.a');
    guiContainer.addEventListener('mouseenter', () => isMouseOverGUI = true);
    guiContainer.addEventListener('mouseleave', () => isMouseOverGUI = false);

    inputBox = createElement('textarea', input_example);

    input_box_height = min(drawing.height * 3 / 5, drawing.height - gui.domElement.clientHeight - 50);
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

    // // 设置输入框的 input 事件监听器
    // inputBox.input(() => {
    //     clearTimeout(typingTimer); // 清除之前的定时器
    //     typingTimer = setTimeout(() => {
    //         process_input();
    //     }, doneTypingInterval);
    // });

    process_input();
}

function read_textarea() {  // init graph
    let alls = inputBox.value();
    let lines = alls.trim().split('\n');
    let [n, m] = lines[0].split(/\s+/).map(Number);
    if (m === undefined) {
        m = lines.length - 1;
    }
    if (!Number.isInteger(n) || !Number.isInteger(m)) {
        throw new Error("输入的点数或边数不是整数!");
    }
    if (m != lines.length - 1) {
        throw new Error("输入的边数有误!");
    }
    let map = new Map();
    let tot = 0;
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
    if (tot > n) {
        throw new Error(`出现的点数超过${n}个!`);
    }
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

function process_input() {
    try {
        read_textarea();
    } catch (error) {
        alert(error.message);
    }
}

function mouseWheel(event) {
    //move the square according to the vertical scroll amount
    if (isMouseOverTextarea) {
        return;
    }
    let scale_val = parameters.scale;
    scale_val += event.delta / 2500;
    scale_val = max(scale_val, 0);
    scale_val = min(scale_val, 1);
    parameters.scale = scale_val;
    scale_controller.updateDisplay();
}

let preX = null, preY = null;
let drag_node = -1;

function mousePressed() {
    if (isMouseOverGUI || isMouseOverTextarea) {
        preX = null;
        preY = null;
        drag_node = -1;
        return;
    }
    preX = mouseX;
    preY = mouseY;
    drag_node = graph.locate_node(mouseX, mouseY);
    graph.set_drag_node(drag_node);
    graph.set_mouse(mouseX, mouseY);
}

function mouseReleased() {
    drag_node = -1;
    graph.set_drag_node(drag_node);
}

function mouseDragged(event) {
    if (preX !== null && preY !== null && preX >= 0 && preX <= width && preY >= 0 && preY <= height) {
        graph.set_drag_node(drag_node);
        if (drag_node == -1) {
            graph.add_bias(mouseX - preX, mouseY - preY);
        }
        preX = mouseX;
        preY = mouseY;
    }
    graph.set_mouse(mouseX, mouseY);
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
    // drawing.textStyle(BOLD);
    graph.set_drawing(drawing);
    graph.set_stroke_color(stroke_color);
    graph.set_delta(map(parameters.speed, 0, 1, 0, 0.2));
    graph.set_bright(map(parameters.bright, 0, 1, 50, 255));
    graph.set_size(map(parameters.size, 0, 1, 15, 100));
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
    resizeCanvas(window.innerWidth - border, window.innerHeight - border);
    drawing = createGraphics(window.innerWidth - border, window.innerHeight - border);
    drawing.clear();

    input_box_height = min(drawing.height * 3 / 5, drawing.height - gui.domElement.clientHeight - 50);
    input_box_width = gui.domElement.clientWidth - 15;
    inputBox.size(input_box_width, input_box_height);
    inputBox.position(drawing.width - input_box_width - 25, drawing.height - input_box_height - 25);
}

function random_position() {
    graph.init_pos();
}


document.addEventListener('keydown', function (event) {
    // 检查是否按下了 Ctrl + S 或 Cmd + S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // 阻止默认的保存页面行为

        process_input();
    }
    if (event.key === 'p') {
        if (parameters.speed <= 0) {
            parameters.speed = 0.5;
        } else {
            parameters.speed = 0;
        }
        gui.updateDisplay();
    }
});
