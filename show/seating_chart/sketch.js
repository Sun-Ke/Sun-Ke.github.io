class Student {
    constructor(name, gender = '男') {
        this.name = name;
        this.gender = gender;
    }
}

class Room {
    constructor(seats, ratio = 1.0, capacity = 40) {
        this.seats = seats;
        this.ratio = ratio;
        this.capacity = capacity;
    }
}

let gui, control_folder, button_folder;
let fileInput;
let LXGW_FONT;
let cell_width;
let cell_height;
let table_width;
let table_height;
let explanation;


let parameters = {
    title: "",
    classroom: "402",
    show_gender: true,
    teacher_view: false,
    scale: 0.75,
    font_size: 0.6,
    save_button: save_image,
    click_me: click_me,
    random: shuffle_students,
    upload_file: function () {
        fileInput.elt.click(); // 触发文件输入元素的点击事件
    }
};

let students = [];
let rooms = new Map();

function preload() {
    // 在这里加载自定义字体
    LXGW_FONT = loadFont('assets/LXGWWenKai-Bold.ttf');
    explanation = loadStrings('assets/template.txt');
    rooms.set("402", new Room(seats = [
        ["1", "2", "", "3", "4", "", "5", "6", "", "7", "8"],
        ["9", "10", "", "11", "12", "", "13", "14", "", "15", "16"],
        ["17", "18", "", "19", "20", "", "21", "22", "", "23", "24"],
        ["25", "26", "", "27", "28", "", "29", "30", "", "31", "32"],
        ["33", "34", "", "35", "36", "", "37", "38", "", "39", "40"],
        ["41", "42", "", "43", "44", "", "45", "46", "", "47", "48"],
    ], ratio = 1.1, capacity = 48));
    rooms.set("403", new Room(seats = [
        ["1", "2", "", "3", "4", "", "5", "6", "", "7", "8"],
        ["9", "10", "", "11", "12", "", "13", "14", "", "15", "16"],
        ["17", "18", "", "19", "20", "", "21", "22", "", "23", "24"],
        ["25", "26", "", "27", "28", "", "29", "30", "", "31", "32"],
        ["33", "34", "", "35", "36", "", "37", "38", "", "39", "40"],
        ["41", "42", "", "43", "44", "", "45", "46", "", "47", "48"],
    ], ratio = 1.1, capacity = 48));
    rooms.set("407", new Room(seats = [
        ["6", "5", "4", "", "3", "2", "1"],
        ["12", "11", "10", "", "9", "8", "7"],
        ["18", "17", "16", "", "15", "14", "13"],
        ["24", "23", "22", "", "21", "20", "19"],
        ["30", "29", "28", "", "27", "26", "25"],
    ], ratio = 1.5, capacity = 30));
    rooms.set("406", new Room(seats = [
        ["31", "", "1", "2", "3", "4", "", "21"],
        ["32", "", "5", "6", "7", "8", "", "22"],
        ["33", "", "9", "10", "11", "12", "", "23"],
        ["34", "", "13", "14", "15", "16", "", "24"],
        ["35", "", "17", "18", "19", "20", "", "25"],
        ["36", "", "", "", "", "", "", "26"],
        ["37", "", "", "", "", "", "", "27"],
        ["38", "", "", "", "", "", "", "28"],
    ], ratio = 1.2, capacity = 38));
    rooms.set("408", new Room(seats = [
        ["31", "", "1", "2", "3", "4", "", "21"],
        ["32", "", "5", "6", "7", "8", "", "22"],
        ["33", "", "9", "10", "11", "12", "", "23"],
        ["34", "", "13", "14", "15", "16", "", "24"],
        ["35", "", "17", "18", "19", "20", "", "25"],
        ["36", "", "", "", "", "", "", "26"],
        ["37", "", "", "", "", "", "", "27"],
        ["38", "", "", "", "", "", "", "28"],
    ], ratio = 1.2, capacity = 38));

    rooms.set("7楼AI", new Room(seats = [
        ["", "28", "", "", "", "", "", "", "", "", ""],
        ["", "27", "", "", "", "", "", "", "", "4", "1"],
        ["24", "26", "", "", "", "", "", "", "", "5", "2"],
        ["23", "25", "", "", "", "", "", "", "", "6", "3"],
        ["", "", "", "", "", "", "", "", "", "", ""],
        ["21", "19", "", "17", "15", "", "13", "11", "", "9", "7"],
        ["22", "20", "", "18", "16", "", "14", "12", "", "10", "8"],
    ], ratio = 1.1, capacity = 28));

    rooms.set("7楼阅览室", new Room(seats = [
        ["8", "7", "6", "5", "4", "3", "2", "1"],
        ["16", "15", "14", "13", "12", "11", "10", "9"],
        ["24", "23", "22", "21", "20", "19", "18", "17"],
        ["32", "31", "30", "29", "28", "27", "26", "25"],
        ["40", "39", "38", "37", "36", "35", "34", "33"],
        ["48", "47", "46", "45", "44", "43", "42", "41"],
    ], ratio = 1.2, capacity = 48));
}

function setup() {
    // dat.GUI 设置
    gui = new dat.GUI();
    let folder = gui.addFolder('title');
    folder.name = "控制面板——按S隐藏/显示"
    control_folder = gui.addFolder('control');
    button_folder = gui.addFolder('button');
    control_folder.add(parameters, 'classroom', Array.from(rooms.keys())).name('classroom').onFinishChange((function (newValue) {
        update_title();
        update_scale();
    }));
    control_folder.add(parameters, 'title', "").name('title');
    update_title();
    control_folder.add(parameters, 'show_gender').name('show_gender');
    control_folder.add(parameters, 'teacher_view').name('teacher_view').onFinishChange(function (newValue) {
        update_title();
    });
    control_folder.add(parameters, 'scale', 0, 1).name('scale');
    control_folder.add(parameters, 'font_size', 0, 1).name('font_size');
    button_folder.add(parameters, 'click_me').name('click me');
    button_folder.add(parameters, 'upload_file').name('upload txt');
    button_folder.add(parameters, 'random').name('random shuffle');
    button_folder.add(parameters, 'save_button').name('save as jpg');

    control_folder.open();
    button_folder.open();
    // 大小和清晰度
    createCanvas(300 * 5, 200 * 5); // A4
    pixelDensity(3);

    // 上传文件按钮
    fileInput = createFileInput(handleFile);
    fileInput.hide();
    frameRate(20);
}

let title_pos_y = 0.08;
let table_pos_y = 0.15;

function draw() {
    background(255);
    // 设置文本居中
    textAlign(CENTER, CENTER);
    // 设置字体
    textFont(LXGW_FONT);
    textSize(30);
    fill(0);

    let classroom = parameters.classroom;
    let is406408 = ["406", "408"].includes(classroom);
    let table = rooms.get(classroom).seats;
    table_width = width * map(parameters.scale, 0, 1, 0.6, 0.95);
    cell_width = table_width / table[0].length;
    cell_height = cell_width / rooms.get(classroom).ratio;
    table_height = (is406408) ? cell_height * 5 : cell_height * table.length;

    // 纵向整体偏移move_y的比例保持居中
    let move_y = 0.5 - (title_pos_y + table_pos_y + table_height / height) / 2;

    // 表格左上角坐标
    let start_x = (width - table_width) / 2;
    let start_y = parameters.teacher_view ? height * (1 - table_pos_y - move_y) - table_height : height * (table_pos_y + move_y);

    text(parameters.title, width / 2, height * (parameters.teacher_view ? (1 - title_pos_y - move_y) : (title_pos_y + move_y)));

    let center_x = start_x + table_width / 2;
    let center_y = start_y + table_height / 2;
    strokeWeight(1.8);
    fill(255);
    rect(start_x, start_y, table_width, table_height);
    textSize(map(parameters.font_size, 0, 1, 15, 35));
    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
            if (table[i][j] === "") continue;
            let order = parseInt(table[i][j]) - 1;
            let cell_height_sp = (is406408 && order >= 20 ? cell_height * 5 / 8 : cell_height);
            let x = start_x + j * cell_width;
            let y = start_y + i * cell_height_sp;

            if (parameters.teacher_view) {
                x = 2 * center_x - x - cell_width;
                y = 2 * center_y - y - cell_height_sp;
            }

            if (order >= students.length) {
                fill(255);
                rect(x, y, cell_width, cell_height_sp);
                fill(0);
                text(table[i][j], x + cell_width / 2, y + cell_height_sp * 0.2);
                continue;
            }
            if (parameters.show_gender) {
                if (students[order].gender === "男") {
                    fill(135, 206, 250);
                } else {
                    fill(255, 160, 122);
                }
            } else {
                fill(255);
            }
            rect(x, y, cell_width, cell_height_sp);
            fill(0);
            text(table[i][j], x + cell_width / 2, y + cell_height_sp * 0.2);
            text(students[order].name, x + cell_width / 2, y + cell_height_sp * 0.65);
        }
    }
    if (classroom === "7楼AI") {
        let i = 0;
        let j = 3;
        let x = start_x + j * cell_width;
        let y = start_y + i * cell_height;
        if (parameters.teacher_view) {
            x = 2 * center_x - x - 5 * cell_width;
            y = 2 * center_y - y - 4 * cell_height;
        }
        fill(255);
        rect(x, y, 5 * cell_width, 4 * cell_height);
        fill(0);
        text("人工智能教师机", x + 5 * cell_width / 2, y + 4 * cell_height * 0.5);
    }
}

function save_image() {
    saveCanvas('seat' + parameters.classroom, 'jpg');
}

function handleFile(file) {
    if (file.type === 'text') {
        students = [];
        try {
            let lines = file.data.split('\n');
            for (let line of lines) {
                let [name, gender = "男"] = line.trim().split(/[ \t]+/);
                if (name === "") {
                    continue;
                }
                students.push(new Student(name, gender));
            }
            random_shuffle(students);
        } catch (error) {
            console.error('读入发生错误：', error.message);
            alert('读入发生错误：' + error.message);
        }
        print(parameters.classroom);
        print(rooms.get(parameters.classroom))
        if (students.length > rooms.get(parameters.classroom).capacity) {
            alert("学生人数" + students.length + "，超过机房容量" + rooms.get(parameters.classroom).capacity + "！");
        }
    } else {
        alert("需要输入txt文件！");
    }
}

function click_me() {
    draw();
    alert(explanation.join('\n'));
}

function shuffle_students() {
    random_shuffle(students);
}

function random_shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function keyPressed() {
    if (key === 's' || key === 'S') {
        if (gui.domElement.style.display === 'none') {
            gui.domElement.style.display = 'block';
        } else {
            gui.domElement.style.display = 'none';
        }
    }
}

function update_title() {
    parameters.title = parameters.classroom + " 布局 ";
    parameters.title += "（" + (parameters.teacher_view ? "教师视野" : "学生视野") + "）";
    control_folder.updateDisplay();
}

function update_scale() {
    let is406408 = ["406", "408"].includes(parameters.classroom);
    if (is406408) {
        parameters.scale = 0.6;
        parameters.font_size = 0.6;
    } else {
        parameters.scale = 0.75;
        parameters.font_size = 0.6;
    }
    control_folder.updateDisplay();
}