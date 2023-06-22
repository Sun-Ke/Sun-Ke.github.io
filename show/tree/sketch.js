let edges;
let tree;
let scale_p, size_p, number_p, style_p, space_p;
let scale_slider, size_slider, space_slider;
let inputbox;
let saveJPG_button, run_button;
let canvas,drawing;
let number_radio,style_radio;
let mp,rev;
let number_dx = 0, number_dy = 0;
function setup() {
    canvas = createCanvas(1280, 720);
    canvas.parent('sketch');
    drawing = createGraphics(1280, 720);
    drawing.clear();
    
    scale_p = createP('scale');
    scale_p.position(10, -10-2);
    
    size_p = createP('size');
    size_p.position(10, 20-2);
    
    space_p = createP('space');
    space_p.position(10, 50-2);
  
    number_p = createP('number');
    number_p.position(10, 80-2);
    
    style_p = createP('style');
    style_p.position(10, 110-2);
    
    
    scale_slider = createSlider(50, 720, 720);
    scale_slider.position(60, 10);
    scale_slider.style('width', '140px');
    
    size_slider = createSlider(10, 80, 35);
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
  
    style_radio = createRadio('style')
    style_radio.position(53,130)
    style_radio.option('layered');
    style_radio.option('radial');
    style_radio.selected('radial');
  
    saveJPG_button = createButton('save as jpg')
    saveJPG_button.position(10, 160);
    saveJPG_button.mousePressed(saveJPG);
    
  
    let title = createElement('h1','Tree Visualization');
    let title2 = createElement('h3','Input n and root — the number of vertices in the tree and the root number (optional). Each of the next n-1 lines contains u and v, denoting an edge connecting vertex u and vertex v. Click \'render\' to see what it looks like. You must ensure that the input data forms a tree. Have fun!');
    
    inputbox = createElement('textarea','6 3\n1 2\n1 3\n2 4\n2 5\n3 6');
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
function keyPressed(){
    if (keyCode === LEFT_ARROW){
        number_dx -= 0.2;
    } else if(keyCode === RIGHT_ARROW){
        number_dx += 0.2;
    } else if(keyCode === UP_ARROW){
        number_dy -= 0.2;
    } else if(keyCode === DOWN_ARROW){
        number_dy += 0.2;
    }
}

function render(){
    let alls = inputbox.value().trim().split('\n');
    let cp = new Map();
    let firstline = alls[0].trim().split(/\s+/);
    let n = parseInt(firstline[0]);
    if(n != alls.length || firstline.length > 2){
        alert('input error!');
        return;
    }
    let tot = 0;
    if (firstline.length == 2)
        cp.set(firstline[1],tot++);
    for(let i = 1; i < n; i++){
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
    if(tot != n){
        alert('input error!');
        return;
    }
    let fa = new Array(n);
    for(let i = 0 ; i < n; i++){
        fa[i] = i;
    }
    function getfa(x){
        if(x == fa[x]) return x;
        fa[x] = getfa(fa[x])
        return fa[x];
    }
    function merge(x,y){
        x = getfa(x);
        y = getfa(y);
        if(x == y){
            return false;
        }
        fa[x] = y;
        return true;
    }
    for(let i = 1; i < n; i++){
        let line = alls[i].trim().split(/\s+/);
        if(!merge(cp.get(line[0]),cp.get(line[1]))){
            alert('input error!');
            return;
        }
    }
    edges = new Array(n);
    for(let i = 0; i < n; i++){
        edges[i] = [];
    }
    for(let i = 1; i < n; i++){
        let line = alls[i].trim().split(/\s+/);
        let x = cp.get(line[0]), y = cp.get(line[1]);
        edges[y].push(x);
        edges[x].push(y);
    }
    mp = cp; //need deep copy?
    rev = new Array(n);
    for(let [key,value] of mp){
        rev[value] = key;
    }
    return;
}

function saveJPG(){
    saveCanvas(drawing, 'tree', 'jpg');
}
function draw() {
    drawing.background(0);
    let type = style_radio.value();
    let space = space_slider.value();
    let scale = scale_slider.value();
    let size = size_slider.value();
    let number_on = number_radio.value();
    if (type == 'radial') {
        tree = new RadialTree(edges,map(space,0,100,0,2*Math.PI));
    } else {
        tree = new LayeredTree(edges,map(space,0,100,0.2,3.5), map(size,10,80,0.05,2.5));
    }
    let pos = [...tree.getPos()];
    let n = edges.length;
    let cx = 0, cy = 0;
    for(let i = 0 ; i < n; i++){
        cx += pos[i].x;
        cy += pos[i].y;
    }
    cx /= n;
    cy /= n;
    let x_min = Infinity, x_max = -Infinity, y_min = Infinity, y_max = -Infinity;
    for(let i = 0 ; i < n; i++){
        pos[i].x -= cx;
        pos[i].y -= cy;
        x_min = min(x_min, pos[i].x);
        x_max = max(x_max, pos[i].x);
        y_min = min(y_min, pos[i].y);
        y_max = max(y_max, pos[i].y);
    }
    let ylen = y_max - y_min + x_max - x_min;
    for(let i = 0 ; i < n; i++){
        drawing.stroke(255);
        drawing.strokeWeight(3);
        drawing.noFill();
        pos[i].x = ((x_max-x_min > 0.001)?map(pos[i].x, x_min, x_max, x_min / ylen * scale, x_max / ylen * scale): pos[i].x) + width / 2;
        pos[i].y = ((y_max-y_min > 0.001)?map(pos[i].y, y_min, y_max, y_min / ylen * scale, y_max / ylen * scale): pos[i].y) + height / 2 + height / 12;
        drawing.circle(pos[i].x, pos[i].y, size);
        if('on' == number_on){
            drawing.textAlign(CENTER, CENTER);
            drawing.textSize(map(size,10,80,10,50));
            drawing.noStroke();
            drawing.fill(255);
            drawing.text(rev[i], pos[i].x - 0.5 + number_dx, pos[i].y + 2.5 + number_dy);
        }     
    }
    for(let i = 0 ; i < n; i++){
        for(let j of edges[i]){
            let vx = pos[j].x - pos[i].x;
            let vy = pos[j].y - pos[i].y;
            let vlen = Math.sqrt(vx**2+vy**2);
            if(vlen < size)
                continue;
            vx /= vlen;
            vy /= vlen;
            drawing.stroke(255);
            drawing.strokeWeight(3);
            drawing.line(pos[i].x + vx * (size/2 + 10),
                 pos[i].y + vy * (size/2 + 10),
                 pos[j].x - vx * (size/2 + 10),
                 pos[j].y - vy * (size/2 + 10),
                )
        }
    }
    image(drawing,0,0);
}