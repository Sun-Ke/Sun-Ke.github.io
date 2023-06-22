let inc = 0.1;
var scl = 15;
let cols, rows;
let zoff = 0;

//var fr;

let particles = [];

let flowfield;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  //fr = createP('');

  flowfield = new Array(cols * rows);

  for (let i = 0; i < 300; i++) {
    particles[i] = new Particle();
  }
  background(255);
  changeFlow();
  setInterval(changeFlow,500);
}
function changeFlow() {
  for (let y = 0, yoff = 0; y < rows; y++, yoff += inc) {
    for (var x = 0, xoff = 0; x < cols; x++, xoff += inc) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI;
      var v = p5.Vector.fromAngle(angle);
      flowfield[index] = v;
      stroke(0, 50);
    }
    zoff += 0.0006;
  }
}
function draw() {
  for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
  if (mouseIsPressed && particles.length<1000)
    particles.push(new Particle(mouseX,mouseY));
}
