const eps = 0.00001;

class ForceDirectedGraph{
    constructor({
      n = 2, 
      edges = [[1],[0]], 
      seed = 1, 
      node_size = 10,
      ratio = 0.05,
      number_on = false,
      symbol = undefined,
      delta = 0.04,
      scale_val = 1
    }={}){
        randomSeed(seed);
        this.L = 50;          // spring rest length
        this.kr = 6250;       // repulsive force constant
        this.ratio = ratio;    // to change the scale of the layout
        this.n = n;
        this.edges = [...edges];
        this.pos = new Array(n);
        this.force = new Array(n);
        this.vel = new Array(n);
        this.size = node_size;
        this.number_on = number_on;
        this.symbol = symbol;
        this.delta = delta;
        this.scale_val = scale_val;
      
        for(let i = 0; i < n; i++) {
            this.pos[i] = createVector(random(-200,200), random(-200,200));
            this.force[i] = createVector(0, 0);
            this.vel[i] = createVector(0, 0);
        }
    }
    set_size(node_size){  
        this.size = node_size;
    }
    set_ratio(ratio){
        this.ratio = ratio;
    }
    set_number_on(number_on){
        this.number_on = number_on;
    }
    set_delta(delta){
        this.delta = delta;
    }
    set_scale_val(scale_val){
        this.scale_val = scale_val;
    }
    get_real_pos(){
        let pos = new Array(this.n);
        let center = createVector(0, 0);
        for(let i = 0; i < this.n; i++){
            pos[i] = this.pos[i].copy();
            center.add(pos[i]);
        }
        center.div(this.n);
        for(let i = 0; i< this.n; i++){
            pos[i].sub(center);
            pos[i].mult(this.scale_val)
        }
        return pos;
    }
    show(){
        let pos = this.get_real_pos();
        translate(width / 2, height / 2);
        
        for(let i = 0; i < this.n; i++) {  
            stroke(255);
            strokeWeight(3);
            noFill();
            circle(pos[i].x, pos[i].y, this.size);
            if(this.number_on && typeof(this.symbol[i]) !== "undefined"){
                textAlign(CENTER, CENTER);
                textSize(map(this.size,10,80,10,50));
                noStroke();
                fill(255);
                text(this.symbol[i], pos[i].x - 0.5, pos[i].y + 2.5);
            }     
        }
        for(let i = 0; i < this.n; i++) {
            for(let j of this.edges[i]) {
                if (i > j)
                    continue;
            let vec = p5.Vector.sub(pos[j], pos[i]).normalize();
            stroke(255);
            strokeWeight(3);
            noFill();
            line(pos[i].x + vec.x * (this.size/2 + 10),
                 pos[i].y + vec.y * (this.size/2 + 10),
                 pos[j].x - vec.x * (this.size/2 + 10),
                 pos[j].y - vec.y * (this.size/2 + 10),
                )
            }
        }
    }
    
    move(){
        let L = this.L;
        let kr = this.kr;
        let ks = this.kr / (this.ratio * (this.L **3));
        let edges = this.edges;
        let pos = this.pos;
        let n = this.n;
        let force = this.force;
        let vel = this.vel;
        for(let i = 0; i < n; i++) {
            let vec = pos[i].copy();
            let dis = vec.mag();
            if (dis > eps) {
                vec.normalize().mult(ks * (dis - L)).mult(-0.2); //to the center
                force[i].x = vec.x;
                force[i].y = vec.y;
            }
        }
        for(let i = 0; i < n; i++) {
            for(let j = i + 1; j < n; j++) {
                let vec = p5.Vector.sub(pos[j], pos[i]);
                let dis = vec.mag();
                if (dis > eps) {
                    vec.normalize().mult(kr / (dis ** 2));
                    force[i].sub(vec);
                    force[j].add(vec);
                }
            }
        }
        for(let i = 0; i < n; i++) {
            for(let j of edges[i]) {
                if(i > j)
                    continue;
                let vec = p5.Vector.sub(pos[j], pos[i]);
                let dis = vec.mag();
                if (dis > eps) {
                    vec.normalize().mult(ks * (dis - L));
                    force[i].add(vec);
                    force[j].sub(vec);
                }
            }
        }
        for(let i = 0; i < n; i++){
            vel[i].add(p5.Vector.mult(force[i], this.delta));
            pos[i].add(p5.Vector.mult(vel[i], this.delta));
        }
    }
}