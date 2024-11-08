class Student {
    constructor(name, gender = '男') {
        this.name = name;
        this.gender = gender;
    }
}

class Room {
    constructor(name, seats, ratio = 1.0, capacity = 40) {
        this.name = name;
        this.seats = seats;
        this.ratio = ratio;
        this.capacity = capacity;
        this.adjs = [];
        if (name === "402" || name === "403") {
            for (let i = 1; i <= 47; i += 2) {
                this.adjs.push([i, i + 1]);
                this.adjs.push([i, i + 1]);
            }
        } else if (name === "406" || name === "408") {
            for (let i = 1; i <= 19; i += 2) {
                this.adjs.push([i, i + 1]);
                this.adjs.push([i, i + 1]);
            }
            for (let i = 21; i <= 27; i++) {
                this.adjs.push([i, i + 1]);
                this.adjs.push([i, i + 1]);
            }
            for (let i = 31; i <= 37; i++) {
                this.adjs.push([i, i + 1]);
                this.adjs.push([i, i + 1]);
            }
        } else if (name === "407") {
            for (let i = 1; i <= 28; i += 3) {
                this.adjs.push([i, i + 1]);
                this.adjs.push([i + 1, i + 2]);
            }
        } else if (name === "7楼AI") {
            this.adjs.push([1, 4]);
            this.adjs.push([2, 5]);
            this.adjs.push([3, 6]);
            this.adjs.push([7, 9]);
            this.adjs.push([8, 10]);
            this.adjs.push([11, 13]);
            this.adjs.push([12, 14]);
            this.adjs.push([15, 17]);
            this.adjs.push([16, 18]);
            this.adjs.push([19, 21]);
            this.adjs.push([20, 22]);
            this.adjs.push([23, 25]);
            this.adjs.push([24, 26]);
        } else if (name === "7楼阅览室") {
            // FIXME
            for (let i = 1; i < 48; i++) {
                if (i % 8 == 0) continue;
                this.adjs.push([i, i + 1]);
            }
        }

        this.seats_map = new Map(); // 座位号(String)转座位下标(Integer) 0-based
        let cnt = 0;
        for (let i = 0; i < seats.length; i++) {
            for (let j = 0; j < seats[i].length; j++) {
                if (seats[i][j] === "") continue;
                this.seats_map.set(seats[i][j], cnt);
                cnt++;
            }
        }
        if (cnt != capacity) {
            alert("room " + name + " wrong!");
        }
    }
}

class Permutation {
    static count = 0;
    constructor(seat_assignments, gender_count, adjacent_count) {
        this.seat_assignments = seat_assignments;
        this.gender_count = gender_count;
        this.adjacent_count = adjacent_count;
        this.order = Permutation.count;
        Permutation.count++;
    }
}

function compare_by_order(a, b) {
    return a.order <= b.order;
}

function compare_by_gender(a, b) {
    return a.gender_count >= b.gender_count;
}

function compare_by_adjacent(a, b) {
    return a.adjacent_count >= b.adjacent_count;
}

let gui, control_folder, button_folder;
let fileInput;
let cell_width;
let cell_height;
let table_width;
let table_height;
let explanation;

let seat_assignments = []; // 座位与学生的对应关系
let seat_rects = [];       // 存储每个座位的位置信息
let dragging_student = null;
let dragging_seat = null;
let dragging_offset = { x: 0, y: 0 };
let dragging_position = { x: 0, y: 0 };

const random_modes = ["default", "sorted", "gender separation", "exam"]

let parameters = {
    title: "",
    classroom: "402",
    show_gender: true,
    teacher_view: false,
    front_first: true,
    random_mode: "default",
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
    explanation = loadStrings('assets/template.txt');
    rooms.set("402", new Room("402", seats = [
        ["1", "2", "", "3", "4", "", "5", "6", "", "7", "8"],
        ["9", "10", "", "11", "12", "", "13", "14", "", "15", "16"],
        ["17", "18", "", "19", "20", "", "21", "22", "", "23", "24"],
        ["25", "26", "", "27", "28", "", "29", "30", "", "31", "32"],
        ["33", "34", "", "35", "36", "", "37", "38", "", "39", "40"],
        ["41", "42", "", "43", "44", "", "45", "46", "", "47", "48"],
    ], ratio = 1.1, capacity = 48));
    rooms.set("403", new Room("403", seats = [
        ["1", "2", "", "3", "4", "", "5", "6", "", "7", "8"],
        ["9", "10", "", "11", "12", "", "13", "14", "", "15", "16"],
        ["17", "18", "", "19", "20", "", "21", "22", "", "23", "24"],
        ["25", "26", "", "27", "28", "", "29", "30", "", "31", "32"],
        ["33", "34", "", "35", "36", "", "37", "38", "", "39", "40"],
        ["41", "42", "", "43", "44", "", "45", "46", "", "47", "48"],
    ], ratio = 1.1, capacity = 48));
    rooms.set("407", new Room("407", seats = [
        ["6", "5", "4", "", "3", "2", "1"],
        ["12", "11", "10", "", "9", "8", "7"],
        ["18", "17", "16", "", "15", "14", "13"],
        ["24", "23", "22", "", "21", "20", "19"],
        ["30", "29", "28", "", "27", "26", "25"],
    ], ratio = 1.5, capacity = 30));
    rooms.set("406", new Room("406", seats = [
        ["31", "", "1", "2", "3", "4", "", "21"],
        ["32", "", "5", "6", "7", "8", "", "22"],
        ["33", "", "9", "10", "11", "12", "", "23"],
        ["34", "", "13", "14", "15", "16", "", "24"],
        ["35", "", "17", "18", "19", "20", "", "25"],
        ["36", "", "", "", "", "", "", "26"],
        ["37", "", "", "", "", "", "", "27"],
        ["38", "", "", "", "", "", "", "28"],
    ], ratio = 1.2, capacity = 36));
    rooms.set("408", new Room("408", seats = [
        ["31", "", "1", "2", "3", "4", "", "21"],
        ["32", "", "5", "6", "7", "8", "", "22"],
        ["33", "", "9", "10", "11", "12", "", "23"],
        ["34", "", "13", "14", "15", "16", "", "24"],
        ["35", "", "17", "18", "19", "20", "", "25"],
        ["36", "", "", "", "", "", "", "26"],
        ["37", "", "", "", "", "", "", "27"],
        ["38", "", "", "", "", "", "", "28"],
    ], ratio = 1.2, capacity = 36));
    rooms.set("7楼AI", new Room("7楼AI", seats = [
        ["", "28", "", "", "", "", "", "", "", "", ""],
        ["", "27", "", "", "", "", "", "", "", "4", "1"],
        ["24", "26", "", "", "", "", "", "", "", "5", "2"],
        ["23", "25", "", "", "", "", "", "", "", "6", "3"],
        ["", "", "", "", "", "", "", "", "", "", ""],
        ["21", "19", "", "17", "15", "", "13", "11", "", "9", "7"],
        ["22", "20", "", "18", "16", "", "14", "12", "", "10", "8"],
    ], ratio = 1.1, capacity = 28));

    rooms.set("7楼阅览室", new Room("7楼阅览室", seats = [
        ["8", "7", "6", "5", "4", "3", "2", "1"],
        ["16", "15", "14", "13", "12", "11", "10", "9"],
        ["24", "23", "22", "21", "20", "19", "18", "17"],
        ["32", "31", "30", "29", "28", "27", "26", "25"],
        ["40", "39", "38", "37", "36", "35", "34", "33"],
        ["48", "47", "46", "45", "44", "43", "42", "41"],
    ], ratio = 1.2, capacity = 48));
}

let perms = new Map();   // TODO: 清空逻辑
const HEAP_SIZE = 10;

function setup() {
    // dat.GUI 设置
    gui = new dat.GUI();
    let folder = gui.addFolder('title');
    folder.name = "控制面板——按S隐藏/显示"
    control_folder = gui.addFolder('control');
    button_folder = gui.addFolder('button');
    control_folder.add(parameters, 'classroom', Array.from(rooms.keys())).name('classroom').onFinishChange((function (newValue) {
        update_title();     // 自动切换标题
        update_scale();     // 自动调整最优参数
        make_seats();       // 重新初始化座位
    }));
    control_folder.add(parameters, 'title', "").name('title');
    control_folder.add(parameters, 'show_gender').name('show_gender');
    control_folder.add(parameters, 'teacher_view').name('teacher_view').onFinishChange(function (newValue) {
        update_title();
    });
    control_folder.add(parameters, 'front_first').name('front_first').onFinishChange(function (newValue) {
        shuffle_students();
    });
    control_folder.add(parameters, 'random_mode', random_modes).name('random_mode').onFinishChange(function (newValue) {
        shuffle_students();
    });
    control_folder.add(parameters, 'scale', 0, 1).name('scale');
    control_folder.add(parameters, 'font_size', 0, 1).name('font_size');

    button_folder.add(parameters, 'upload_file').name('upload txt');
    button_folder.add(parameters, 'random').name('random shuffle');
    button_folder.add(parameters, 'save_button').name('save as jpg');
    button_folder.add(parameters, 'click_me').name('click me');

    control_folder.open();
    button_folder.open();

    update_title();

    // 大小和清晰度
    createCanvas(300 * 5, 200 * 5); // A4
    pixelDensity(3);

    // 上传文件按钮
    fileInput = createFileInput(handleFile);
    fileInput.hide();
    // frameRate(20);
    make_seats();
    for (let room of Array.from(rooms.keys())) {
        for (let front_first of [false, true]) {
            perms.set(JSON.stringify({ room: room, front_first: front_first, random_mode: "default" }), new MinHeap(compare_by_order));
            perms.set(JSON.stringify({ room: room, front_first: front_first, random_mode: "gender separation" }), new MinHeap(compare_by_gender));
            perms.set(JSON.stringify({ room: room, front_first: front_first, random_mode: "exam" }), new MinHeap(compare_by_adjacent));
        }
    }

    // 设置字体
    textFont("LXGW WenKai Screen");
    // font-family	                font-weight
    // LXGW WenKai Screen		    normal
    // LXGW WenKai Screen R		    normal
    // LXGW WenKai GB Screen	    normal
    // LXGW WenKai GB Screen R	    normal
    // LXGW WenKai Mono Screen	    normal
    // LXGW WenKai Mono GB Screen	normal
    // textStyle(BOLD);
}

let title_pos_y = 0.08;
let table_pos_y = 0.15;

function draw() {
    background(255);

    let classroom = parameters.classroom;
    let is406408 = ["406", "408"].includes(classroom);
    let table = rooms.get(classroom).seats;
    let seats_map = rooms.get(classroom).seats_map;
    table_width = width * map(parameters.scale, 0, 1, 0.6, 0.95);
    cell_width = table_width / table[0].length;
    cell_height = cell_width / rooms.get(classroom).ratio;
    table_height = (is406408) ? cell_height * 5 : cell_height * table.length;

    // 纵向整体偏移move_y的比例保持居中
    let move_y = 0.5 - (title_pos_y + table_pos_y + table_height / height) / 2;

    // 表格左上角坐标
    let start_x = (width - table_width) / 2;
    let start_y = parameters.teacher_view ? height * (1 - table_pos_y - move_y) - table_height : height * (table_pos_y + move_y);
    // 设置文本居中
    textAlign(CENTER, CENTER);
    textSize(30);
    fill(0);
    text(parameters.title, width / 2, height * (parameters.teacher_view ? (1 - title_pos_y - move_y) : (title_pos_y + move_y)));

    let center_x = start_x + table_width / 2;
    let center_y = start_y + table_height / 2;
    strokeWeight(1.8);
    fill(255);
    rect(start_x, start_y, table_width, table_height);
    textSize(map(parameters.font_size, 0, 1, 15, 35));

    seat_rects = []

    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
            if (table[i][j] === "") continue;
            let order = seats_map.get(table[i][j]);      // 座位索引
            let student_index = seat_assignments[order]; // 学生索引
            let cell_height_sp = (is406408 && parseInt(table[i][j]) > 20 ? cell_height * 5 / 8 : cell_height);
            let x = start_x + j * cell_width;
            let y = start_y + i * cell_height_sp;

            if (parameters.teacher_view) {
                x = 2 * center_x - x - cell_width;
                y = 2 * center_y - y - cell_height_sp;
            }
            // 记录座位的位置信息
            seat_rects.push({
                seat_number: table[i][j],
                seat_index: order,
                x: x,
                y: y,
                width: cell_width,
                height: cell_height_sp,
                student_index: student_index
            });

            // 绘制座位和学生姓名
            if (dragging_seat && order === dragging_seat.seat_index) {
                // 当前座位正在被拖动，不绘制学生姓名
                // 仍然绘制座位矩形
                fill(255);
                rect(x, y, cell_width, cell_height_sp);
                fill(0);
                text(table[i][j], x + cell_width / 2, y + cell_height_sp * 0.2);
                continue;
            }

            if (student_index !== undefined && student_index !== null) {
                let student = students[student_index];
                if (parameters.show_gender) {
                    if (student.gender === "男") {
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
                text(student.name, x + cell_width / 2, y + cell_height_sp * 0.65);
            } else {
                // 空座位
                fill(255);
                rect(x, y, cell_width, cell_height_sp);
                fill(0);
                text(table[i][j], x + cell_width / 2, y + cell_height_sp * 0.2);
            }
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
        push();
        fill(255);
        strokeWeight(1.8);
        rect(x, y, 5 * cell_width, 4 * cell_height);
        fill(0);
        text("人工智能教师机", x + 5 * cell_width / 2, y + 4 * cell_height * 0.5);
        pop();
    }

    // 绘制正在拖动的学生
    if (dragging_student) {
        push();
        if (dragging_student.gender === "男") {
            fill(135, 206, 250, 80);
        } else {
            fill(255, 160, 122, 80);
        }
        noStroke();
        dragging_position.x = lerp(dragging_position.x, mouseX + dragging_offset.x - cell_width / 2, 0.2);
        dragging_position.y = lerp(dragging_position.y, mouseY + dragging_offset.y - cell_height / 2, 0.2);
        rect(dragging_position.x, dragging_position.y, cell_width, cell_height);
        fill(0, 0, 0, 150); // 调整文字颜色的透明度
        textAlign(CENTER, CENTER);
        text(dragging_student.name, dragging_position.x + cell_width / 2, dragging_position.y + cell_height * 0.65);
        pop();
    }
}

function save_image() {
    saveCanvas('seat_' + parameters.classroom + "_" + (parameters.teacher_view ? "教师" : "学生"), 'jpg');
}

function make_permutation(seat_assignments) {  // 计算排列的各项feature，返回Permutation对象
    let gender_count = 0;
    let adjacent_count = 0;
    let adjs = rooms.get(parameters.classroom).adjs;
    let seats_map = rooms.get(parameters.classroom).seats_map;
    for (let [x, y] of adjs) { // [1, 2]
        x = seats_map.get(x.toString());
        y = seats_map.get(y.toString());
        if (Number.isInteger(seat_assignments[x]) && Number.isInteger(seat_assignments[y])) {
            if (students[seat_assignments[x]].gender === students[seat_assignments[y]].gender) {
                gender_count++;
            }
            adjacent_count++;
        }
    }
    return new Permutation(seat_assignments, gender_count, adjacent_count);
}

function make_seats() { // seat_assignments初始化
    // print(parameters.classroom);
    let capacity = rooms.get(parameters.classroom).capacity;
    if (students.length > capacity) {
        alert("学生人数" + students.length + "，超过机房容量" + capacity + "！");
    }
    seat_assignments = [];
    for (let i = 0; i < capacity; i++) {
        if (i < students.length) {
            seat_assignments[i] = i; // 学生索引
        } else {
            seat_assignments[i] = null; // 空座位
        }
    }
}

function handleFile(file) {
    if (file.type !== 'text') {
        alert("需要输入txt文件！");
        return;
    }
    // 读入每行姓名性别到students
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
        random_shuffle(students, students.length);
    } catch (error) {
        console.error('读入发生错误：', error.message);
        alert('读入发生错误：' + error.message);
    }
    // 清空perms
    for (let [key, heap] of perms) {
        heap.clear();
    }
    make_seats();
    prepare_heap(10);
    shuffle_students();
}

function click_me() {
    draw();
    alert(explanation.join('\n'));
}

let heap_locked = false;  // 是否需要上锁？
function shuffle_students() {
    if (students.length === 0) return;
    if (parameters.random_mode === "sorted") {
        // 按照姓名字典序排
        seat_assignments.sort(function (a, b) {
            if (a === null && b === null) return 0;
            if (a === null) return 1;
            if (b === null) return -1;
            if (students[a].name < students[b].name) {
                return -1;
            }
            if (students[a].name > students[b].name) {
                return 1;
            }
            return 0;
        });
        return;
    }
    prepare_heap(1);
    let key = { room: parameters.classroom, front_first: parameters.front_first, random_mode: parameters.random_mode }
    let heap = perms.get(JSON.stringify(key));
    seat_assignments = [...heap.random().seat_assignments];
}

function prepare_heap(times) {   // 需要准备好seat_assignments和perms
    // print("prepare", times);
    if (times <= 0) return;
    let seats = [...seat_assignments];
    let len = seats.length;
    if (len === 0) return;
    // heap_locked = true;
    for (let i = 0; i < 100; i++) {
        random_shuffle(seats, len);
        for (let random_mode of random_modes) {
            if (random_mode === "sorted") continue;
            let key = { room: parameters.classroom, front_first: false, random_mode: random_mode };
            let heap = perms.get(JSON.stringify(key));
            heap.insert(make_permutation([...seats]));
            if (heap.size() > HEAP_SIZE) {
                heap.pop();
            }
        }
    }
    len = swap_null_to_end(seats);
    for (let i = 0; i < 100; i++) {
        random_shuffle(seats, len);
        for (let random_mode of random_modes) {
            if (random_mode === "sorted") continue;
            let key = { room: parameters.classroom, front_first: true, random_mode: random_mode };
            let heap = perms.get(JSON.stringify(key));
            heap.insert(make_permutation([...seats]));
            if (heap.size() > HEAP_SIZE) {
                heap.pop();
            }
        }
    }
    // heap_locked = false;
    setTimeout(() => prepare_heap(times - 1), 200);
    // print("prepare end", times);
}

function swap_null_to_end(array) {
    let j = 0;
    let len = array.length;
    for (let i = 0; i < len; i++) {
        if (array[i] !== null) {
            [array[i], array[j]] = [array[j], array[i]];
            j++;
        }
    }
    return j;
}

function random_shuffle(array, len) {   // 随机打乱数组的前len个元素
    let currentIndex = len, randomIndex;
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

function mousePressed() {
    let gui_rect = gui.domElement.getBoundingClientRect();
    if (mouseX >= gui_rect.left && mouseX <= gui_rect.right && mouseY >= gui_rect.top && mouseY <= gui_rect.bottom) {
        // 点在dat.gui上
        return;
    }
    for (let seat of seat_rects) {
        if (
            seat.student_index !== null &&
            mouseX >= seat.x &&
            mouseX <= seat.x + seat.width &&
            mouseY >= seat.y &&
            mouseY <= seat.y + seat.height
        ) {
            dragging_student = students[seat.student_index];
            dragging_seat = seat;
            dragging_offset.x = seat.x + seat.width / 2 - mouseX;
            dragging_offset.y = seat.y + seat.height / 2 - mouseY;
            dragging_position.x = seat.x;
            dragging_position.y = seat.y;
            break;
        }
    }
    if (dragging_student) {
        cursor('grabbing'); // 改变鼠标指针为抓取状态
    }
}

function mouseReleased() {
    if (dragging_student) {
        let target_seat = null;
        for (let seat of seat_rects) {
            if (
                mouseX >= seat.x &&
                mouseX <= seat.x + seat.width &&
                mouseY >= seat.y &&
                mouseY <= seat.y + seat.height
            ) {
                target_seat = seat;
                break;
            }
        }
        if (target_seat) {
            // 交换座位上的学生
            [seat_assignments[dragging_seat.seat_index], seat_assignments[target_seat.seat_index]] =
                [seat_assignments[target_seat.seat_index], seat_assignments[dragging_seat.seat_index]];
        }
        dragging_student = null;
        dragging_seat = null;
    }
    cursor('default'); // 恢复默认鼠标指针
}
