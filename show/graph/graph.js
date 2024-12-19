const eps = 0.0001;

class ForceDirectedGraph {
    constructor({
        n = 2,
        edges = [[1], [0]],
        seed = 1,
        node_size = 10,
        ratio = 0.05,
        number_on = false,
        symbol = undefined,
        delta = 0.04,
        scale_val = 1,
        dragc = 0.008,
        bright = 255,
    } = {}) {
        // randomSeed(seed);
        this.L = 50;          // spring rest length
        this.kr = 6250;       // repulsive force constant
        this.ratio = ratio;    // to change the scale of the layout
        this.n = n;                  // number of vertices 
        this.edges = [...edges];
        this.pos = new Array(n);     // positions
        this.force = new Array(n);   // temporary
        this.vel = new Array(n);     // speed
        this.size = node_size;       // real circle diameter
        this.number_on = number_on;  // number on or off
        this.symbol = symbol;
        this.delta = delta;          // each time step
        this.scale_val = scale_val;
        this.dragc = dragc;          // drag force constant
        this.bright = bright;        // transparency
        this.detX = 0;
        this.detY = 0;
        this.drag_node = -1;
        this.init_pos();
    }
    set_drawing(drawing) {
        this.drawing = drawing;
    }
    set_stroke_color(stroke_color) {
        this.stroke_color = stroke_color;
    }
    set_size(node_size) {
        this.size = node_size;
    }
    set_ratio(ratio) {
        this.ratio = ratio;
    }
    set_number_on(number_on) {
        this.number_on = number_on;
    }
    set_delta(delta) {
        this.delta = delta;
    }
    set_scale_val(scale_val) {
        this.scale_val = scale_val;
    }
    set_bright(bright) {
        this.bright = bright;
    }
    set_drag_node(drag_node) {
        this.drag_node = drag_node;
    }
    add_bias(dx, dy) {
        this.detX += dx;
        this.detY += dy;
    }
    init_pos() {
        for (let i = 0; i < this.n; i++) {
            this.pos[i] = createVector(random(-100, 100), random(-100, 100));
            this.force[i] = createVector(0, 0);
            this.vel[i] = createVector(0, 0);
        }
    }
    get_mass_center() {
        let mass_center = createVector(0, 0);
        for (let i = 0; i < this.n; i++) {
            mass_center.add(this.pos[i]);
        }
        mass_center.div(this.n);
        return mass_center;
    }
    get_real_pos() {
        let pos = new Array(this.n);
        let mass_center = this.get_mass_center();
        let bias = createVector(this.drawing.width / 2 + this.detX, this.drawing.height / 2 + this.detY);
        for (let i = 0; i < this.n; i++) {
            pos[i] = this.pos[i].copy();
        }
        for (let i = 0; i < this.n; i++) {
            pos[i].sub(mass_center);
            pos[i].mult(this.scale_val);
            pos[i].add(bias);
        }
        return pos;
    }
    real_pos_to_virtual(x, y) {
        let mass_center = this.get_mass_center();
        let bias = createVector(this.drawing.width / 2 + this.detX, this.drawing.height / 2 + this.detY);
        let res = createVector(x, y);
        res.sub(bias);
        res.div(this.scale_val);
        res.add(mass_center);
        return res;
    }
    virtual_pos_to_real(x, y) {
        let mass_center = this.get_mass_center();
        let bias = createVector(this.drawing.width / 2 + this.detX, this.drawing.height / 2 + this.detY);
        let res = createVector(x, y);
        res.sub(mass_center);
        res.mult(this.scale_val);
        res.add(bias);
        return res;
    }
    locate_node(x, y) {
        let pos = this.get_real_pos();
        let now = createVector(x, y);
        let mindis = Infinity, res = 0;
        for (let i = 0; i < this.n; i++) {
            let dis = p5.Vector.dist(pos[i], now);
            if (dis < mindis) {
                mindis = dis;
                res = i;
            }
        }
        if (mindis > this.size / 2 + 5)
            res = -1;
        return res;
    }
    set_mouse(mousex, mousey) {
        this.mouse_virtual_pos = this.real_pos_to_virtual(mousex, mousey);
    }
    show() {
        let drawing = this.drawing;
        drawing.textFont('Georgia');
        drawing.textAlign(CENTER, CENTER);
        drawing.textSize(map(this.size, 10, 80, 10, 50));
        let pos = this.get_real_pos();
        // 检查计算值是否异常
        for (let i = 0; i < this.n; i++) {
            if (isNaN(pos[i].x) || pos[i].x === Infinity || pos[i].x === -Infinity)
                return false;
            if (isNaN(pos[i].y) || pos[i].y === Infinity || pos[i].y === -Infinity)
                return false;
            if (abs(pos[i].x) > 1.0e+20 || abs(pos[i].y) > 1.0e+20)
                return false;
        }
        // 画圆
        drawing.stroke(this.stroke_color);
        drawing.strokeWeight(2.2);
        drawing.noFill();
        for (let i = 0; i < this.n; i++) {
            drawing.circle(pos[i].x, pos[i].y, this.size);
        }
        // 画编号
        if (this.number_on) {
            drawing.noStroke();
            drawing.fill(this.stroke_color);
            for (let i = 0; i < this.n; i++) {
                if (typeof (this.symbol[i]) !== "undefined") {
                    drawing.text(this.symbol[i], pos[i].x, pos[i].y);
                }
            }
        }
        // 画边
        drawing.stroke(this.stroke_color, this.bright);
        drawing.strokeWeight(map(this.bright, 0, 255, 1.5, 2.2));
        drawing.noFill();
        for (let i = 0; i < this.n; i++) {
            for (let j of this.edges[i]) {
                if (i > j)
                    continue;
                let vec = p5.Vector.sub(pos[j], pos[i]).normalize();
                drawing.line(pos[i].x + vec.x * (this.size / 2 + 8),
                    pos[i].y + vec.y * (this.size / 2 + 8),
                    pos[j].x - vec.x * (this.size / 2 + 8),
                    pos[j].y - vec.y * (this.size / 2 + 8),
                )
            }
        }
        image(drawing, 0, 0);
        return true;
    }

    move() {
        let L = min(this.L, max(35, this.size) / this.scale_val * 3 / 4);  // 避免两球重合
        let kr = this.kr;
        let ks = this.kr / (this.ratio * (L ** 3));
        let edges = this.edges;
        let pos = this.pos;
        let n = this.n;
        let force = this.force;
        let vel = this.vel;
        for (let i = 0; i < n; i++) {
            let vec = pos[i].copy();
            let dis = vec.mag();
            dis = max(dis, eps);
            vec.normalize().mult(ks * (dis - L)).mult(-0.2); //to the center
            force[i] = vec.copy();
            vec = vel[i].copy();
            let v2 = vec.magSq();
            vec.normalize();
            vec.mult(-this.dragc * v2);
            force[i].add(vec);
        }
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                let vec = p5.Vector.sub(pos[j], pos[i]);
                let dis = vec.mag();
                if (dis > eps) {
                    vec.normalize().mult(kr / (dis ** 2));
                    force[i].sub(vec);
                    force[j].add(vec);
                }
            }
        }
        for (let i = 0; i < n; i++) {
            for (let j of edges[i]) {
                if (i > j)
                    continue;
                let vec = p5.Vector.sub(pos[j], pos[i]);
                let dis = vec.mag();
                dis = max(dis - 1.8 * this.size, eps);
                vec.normalize().mult(ks * (dis - L));
                force[i].add(vec);
                force[j].sub(vec);
            }
        }

        for (let i = 0; i < n; i++) {
            if (i === this.drag_node) {
                // 直接修改drag_node的位置和速度，朝鼠标移动
                force[i] = createVector(0, 0);
                let x = lerp(pos[i].x, this.mouse_virtual_pos.x, 0.05);
                let y = lerp(pos[i].y, this.mouse_virtual_pos.y, 0.05);
                if (this.delta < eps) {
                    vel[i] = createVector(0, 0);
                } else {
                    vel[i] = createVector((x - pos[i].x) / this.delta, (y - pos[i].y) / this.delta);
                }
                pos[i] = createVector(x, y);
            } else {
                vel[i].add(p5.Vector.mult(force[i], this.delta));
                pos[i].add(p5.Vector.mult(vel[i], this.delta));
            }
        }
    }
}