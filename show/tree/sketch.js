let edges;
let tree; 
let node_size = 20;
let slider;
function setup() {
    createCanvas(640, 360);
    slider = createSlider(50, 150, 100);
    slider.position(10, 10);
    slider.style('width', '80px');
    edges = [
        [1,2],
        [],
        [3,4],
        [],
        []
    ];
}

function draw() {
    background(0);
    tree = new Tree(edges,2*Math.PI);
    let pos = [...tree.pos];
    let n = edges.length;
    let cx = 0, cy = 0;
    for(let i = 0 ; i < n; i++){
        cx += pos[i].x;
        cy += pos[i].y;
    }
    cx /= n;
    cy /= n;
    for(let i = 0 ; i < n; i++){
        stroke(255);
        strokeWeight(3);
        noFill();
        pos[i].x = (pos[i].x - cx) * slider.value() + windowWidth / 2;
        pos[i].y = (pos[i].y - cy) * slider.value() + windowHeight / 4;
        circle(pos[i].x, pos[i].y, node_size);
    }
    for(let i = 0 ; i < n; i++){
        for(let j of edges[i]){
            let vx = pos[j].x - pos[i].x;
            let vy = pos[j].y - pos[i].y;
            let vlen = Math.sqrt(vx**2+vy**2);
            if(vlen < 2 * node_size)
                continue;
            vx /= vlen;
            vy /= vlen;
            stroke(255);
            strokeWeight(3);
            line(pos[i].x + vx * node_size,
                 pos[i].y + vy * node_size,
                 pos[j].x - vx * node_size,
                 pos[j].y - vy * node_size,
                )
        }
    }
}