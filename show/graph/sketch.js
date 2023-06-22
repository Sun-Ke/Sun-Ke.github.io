let graph;
let canvas;
let inputbox;
let n, edges, rev;
let bright_p, size_p, space_p, number_p, color_p;
let bright_slider, size_slider, space_slider, number_radio, color_radio;
let scale_val = 1;
function setup(){
    canvas = createCanvas(1280, 720);
  
    bright_p = createP('bright');
    bright_p.position(10, -10-2);
    
    size_p = createP('size');
    size_p.position(10, 20-2);
    
    space_p = createP('space');
    space_p.position(10, 50-2);
  
    number_p = createP('number');
    number_p.position(10, 80-2);
    
    color_p = createP('color');
    color_p.position(10, 110-2);
  
    bright_slider = createSlider(0, 100, 75);
    bright_slider.position(60, 10);
    bright_slider.style('width', '140px');
    
    size_slider = createSlider(0, 100, 50);
    size_slider.position(60, 40);
    size_slider.style('width', '140px');
    
    space_slider = createSlider(0, 100, 50);
    space_slider.position(60, 70);
    space_slider.style('width', '140px');
    
    number_radio = createRadio('number')
    number_radio.position(90,100)
    number_radio.option('on');
    number_radio.option('off');
    number_radio.selected('off');
    
    color_radio = createRadio('color');
    color_radio.position(69.5,130)
    color_radio.option('black');
    color_radio.option('white');
    color_radio.selected('white');
  
    saveJPG_button = createButton('save as jpg')
    saveJPG_button.position(10, 160);
    saveJPG_button.mousePressed(saveJPG);
  
    let title = createElement('h1','Graph Visualization');
    let title2 = createElement('h3','Input n and m — the number of vertices and the number of edges in the graph. Each of the next m lines contains u and v, denoting an edge connecting vertex u and vertex v. Click \'render\' to see what it looks like. Have fun!');
    
    
    inputbox = createElement('textarea','5 6\n1 2\n1 3\n2 4\n3 4\n1 5\n2 3');
    inputbox.attribute('rows','7');
    inputbox.attribute('cols','15');
    inputbox.style('font-size','1.6em');
  
    run_button = createButton('render');
    run_button.style('width','87.28px');
    run_button.style('height','33.6px');
    run_button.style('font-size','21.3333px');
    run_button.mousePressed(render);
  
    render();
}

function render(){
    let alls = inputbox.value().trim().split('\n');
    let cp = new Map();
    let firstline = alls[0].trim().split(/\s+/);
    if (2 != firstline.length) {
        alert('Input error!');
        return;
    }
    n = parseInt(firstline[0]);
    let m = parseInt(firstline[1]);
    if(isNaN(n) || isNaN(m) || n == 0) {
        alert('Input error!');
        return;
    }
    let tot = 0;
    if(m != alls.length - 1){
        alert('Input error!');
        return;
    }
    for(let i = 1; i <= m; i++){
        let line = alls[i].trim().split(/\s+/);
        if(2 != line.length){
            alert('Input error!');
            return;
        }
        if(!cp.has(line[0])){
            cp.set(line[0],tot++);
        }
        if(!cp.has(line[1])){
            cp.set(line[1],tot++);
        } 
    }
    if(tot > n){
        alert('Input error!');
        return;
    }
    edges = new Array(n);
    for(let i = 0; i < n; i++){
        edges[i] = [];
    }
    for(let i = 1; i <= m; i++){
        let line = alls[i].trim().split(/\s+/);
        let x = cp.get(line[0]), y = cp.get(line[1]);
        if(x == y || edges[x].indexOf(y) != -1) 
            continue;
        edges[y].push(x);
        edges[x].push(y);
    }
    rev = new Array(n);
    for(let [key,value] of cp){
        rev[value] = key;
    }
    graph = new ForceDirectedGraph({
      'n': n,
      'edges': edges,
      'symbol': rev
    })
    //some values in rev can be undefined
}

function mouseWheel(event) {
    //move the square according to the vertical scroll amount
    scale_val += event.delta / 2500;
    scale_val = max(scale_val, 0.1);
    scale_val = min(scale_val, 3);
    return false;
}

let preX,preY;
let drag_node = -1;

function mousePressed() {
    preX = mouseX;
    preY = mouseY;
    if(preX<222 && preY<222) {
        preX = -1;
        preY = -1;
    } else {
        drag_node = graph.locate_node(preX, preY);
    }
}
function mouseReleased() {
    drag_node = -1;
}
function mouseDragged(event) {
    if(preX>=0 && preX<=width && preY>=0 && preY<=height) {
        if(drag_node == -1) {
            graph.add_bias(mouseX - preX, mouseY - preY);    
        } else {
            graph.pull(drag_node, mouseX - preX, mouseY - preY); 
        }
        preX = mouseX;
        preY = mouseY;
    }
}

function keyTyped() {
    if (key == 'f' || key == 'F') {
        graph.set_delta(1);
    }
}

function keyReleased() {
    graph.set_delta(0.04);
}
function saveJPG(){
    saveCanvas(canvas, 'graph', 'jpg');
}

function draw(){
    let paint = ('white' == color_radio.value())? 255 : 0;
    bright_p.style('color',color_radio.value());
    size_p.style('color',color_radio.value());
    space_p.style('color',color_radio.value());
    number_p.style('color',color_radio.value());
    color_p.style('color',color_radio.value());
    radios = selectAll('input[type="radio"] + label');
    for(let radio of radios) {
        radio.style('color',color_radio.value());
    }
    background(255-paint);
    graph.set_bright(map(bright_slider.value(),0,100,50,255));
    graph.set_size(map(size_slider.value(),0,100,0.5,100));
    graph.set_ratio(map(space_slider.value(),0,100,3,40));
    graph.set_number_on('on' === number_radio.value())
    graph.set_scale_val(scale_val);
    graph.move();
    let ok = graph.show(paint);
    if (!ok) {
        alert('Oops, two particles collided!');
        graph = new ForceDirectedGraph({
          'n': n,
          'edges': edges,
          'symbol': rev,
        })
    }
}