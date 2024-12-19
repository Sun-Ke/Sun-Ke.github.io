class MinHeap {
    constructor(compareFunction = (a, b) => a <= b) {
        this.heap = [];
        this.compare = compareFunction;
    }

    // 插入元素
    insert(element) {
        this.heap.push(element);
        this.shiftup(this.heap.length - 1);
    }

    top() {
        return this.heap[0];
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // 取出堆顶元素
    pop() {
        const min = this.heap[0];
        const end = this.heap.pop();

        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.shiftdown(0);
        }

        return min;
    }

    // 上浮操作，维持最小堆性质
    shiftup(index) {
        while (index > 0) {
            const parent = (index - 1) >> 1;
            if (!this.compare(this.heap[parent], this.heap[index])) {
                this.swap(index, parent);
                index = parent;
            } else {
                break;
            }
        }
    }

    // 下沉操作，维持最小堆性质
    shiftdown(index) {
        const length = this.heap.length;
        while (2 * index + 1 < length) {
            let child = 2 * index + 1;
            if (child + 1 < length && this.compare(this.heap[child + 1], this.heap[child])) {
                child++;
            }
            if (!this.compare(this.heap[index], this.heap[child])) {
                this.swap(index, child);
                index = child;
            } else {
                break;
            }
        }
    }

    // 获取堆的大小
    size() {
        return this.heap.length;
    }

    clear() {
        this.heap.length = 0;
    }

    random() {
        const index = Math.floor(Math.random() * this.heap.length);
        return this.heap[index];
    }
}
