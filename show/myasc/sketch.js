let gui;
let gfx;
let input, img, myCapture;
let params = {
    fontSize: 8,
    fontName: "monospace",
    column: 120,
    row: 60,
    invert: false,
    tint: 128,
    posterize: 3,
    background: '#000000',
    text: '#ffffff',
    video: false,
    upload: function () {
        document.getElementById('user_input').click();
    },
};

function preload() {
    img = loadImage('example.jpg', function (img) {
        img.resize(640, 0);
        console.log(
            'example.jpg ready. Resolution: ' +
            img.width + ' ' + img.height
        );
    });

    try {
        myCapture = createCapture(VIDEO);
        myCapture.size(640, 480);
        myCapture.elt.setAttribute('playsinline', '');
        myCapture.hide();
        console.log(
            '[initCaptureDevice] capture ready. Resolution: ' +
            myCapture.width + ' ' + myCapture.height
        );
    } catch (_err) {
        console.log('[initCaptureDevice] capture error: ' + _err);
    }
}

function setup() {
    createCanvas(1024, 768);

    input = createFileInput(handleFile, false);
    input.id('user_input');
    input.hide();

    gui = new dat.GUI();
    gui.add(params, "fontSize", 4, 12, 0.25);
    gui.add(params, "fontName", ["sans-serif", "serif", "cursive", "monospace"]);
    gui.add(params, "column", 40, 256, 2).onChange(changeSize);
    gui.add(params, "row", 40, 256, 2).onChange(changeSize);
    gui.add(params, "invert");
    gui.add(params, "tint", 0, 255, 1);
    gui.add(params, "posterize", 2, 10, 1);
    gui.addColor(params, "background");
    gui.addColor(params, "text");
    gui.add(params, "video").onChange(changeVideo);
    gui.add(params, "upload");

    gfx = createGraphics(params.column, params.row);
    gfx.pixelDensity(1);
    frameRate(30);
    //noLoop();
}

function handleFile(file) {
    if (file.type === 'image') {
        img = loadImage(file.data, function (img) {
            img.resize(640, 0);
            console.log(
                'image ready. Resolution: ' +
                img.width + ' ' + img.height
            );

        });
    } else {
        alert('Not a valid image file.');
    }
}

function draw() {
    resizeCanvas(img.width, img.height);
    background(params.background);
    myAsciiArt = new AsciiArt(this, params.fontName);
    myAsciiArt.invertBrightnessFlag = params.invert;
    textAlign(CENTER, CENTER);
    textFont(params.fontName, params.fontSize);
    textStyle(NORMAL);
    noStroke();
    fill(params.text);

    gfx.image(params.video && myCapture !== undefined ? myCapture : img, 0, 0, gfx.width, gfx.height);
    gfx.filter(POSTERIZE, params.posterize);

    ascii_arr = myAsciiArt.convert(gfx);
    myAsciiArt.typeArray2d(ascii_arr, this);
    tint(255, params.tint);
    image(params.video && myCapture !== undefined ? myCapture : img, 0, 0, width, height);
    noTint();
}

function changeSize() {
    gfx = createGraphics(params.column, params.row);
    gfx.pixelDensity(1);
}

function changeVideo() {

}