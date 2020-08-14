let graph;
let canvas;
let inputbox;
let mp, rev;
let speed_p, size_p, space_p, number_p;
let speed_slider, size_slider, space_slider;
let scale_val = 1;
function setup(){
    canvas = createCanvas(1280, 720);
  
    speed_p = createP('speed');
    speed_p.position(10, -10-2);
    
    size_p = createP('size');
    size_p.position(10, 20-2);
    
    space_p = createP('space');
    space_p.position(10, 50-2);
  
    number_p = createP('number');
    number_p.position(10, 80-2);
      
    speed_slider = createSlider(0, 100, 50);
    speed_slider.position(60, 10);
    speed_slider.style('width', '140px');
    
    size_slider = createSlider(10, 80, 45);
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
    
    saveJPG_button = createButton('save as jpg')
    saveJPG_button.position(10, 130);
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
        alert('input error!');
        return;
    }
    let n = parseInt(firstline[0]), m = parseInt(firstline[1]);
    if(isNaN(n) || isNaN(m) || n == 0) {
        alert('input error!');
        return;
    }
    let tot = 0;
    if(m != alls.length - 1){
        alert('input error!');
        return;
    }
    for(let i = 1; i <= m; i++){
        let line = alls[i].trim().split(/\s+/);
        if(2 != line.length){
            alert('input error!');
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
        alert('input error!');
        return;
    }
    let edges = new Array(n);
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
    mp = cp;
    rev = new Array(n);
    for(let [key,value] of mp){
        rev[value] = key;
    }
    graph = new ForceDirectedGraph({
      'n': n,
      'edges': edges,
      'ratio': 0.5,
      'node_size': 50,
      'symbol': rev,
      'delta': 0.04
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

function saveJPG(){
    saveCanvas(canvas, 'graph', 'jpg');
}

function draw(){
    background(0);
    graph.set_delta(map(speed_slider.value(),0,100,0.0002,0.2));
    graph.set_size(size_slider.value());
    graph.set_ratio(map(space_slider.value(),0,100,0.04,10));
    graph.set_number_on('on' === number_radio.value())
    graph.set_scale_val(scale_val);
    graph.move();
    graph.show();
}