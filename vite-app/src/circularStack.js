// Stack structure which rewrites old elements to keep its size in check.
// Used for undoing
export default class CircularStack {
    constructor(size) {
        this.size = size;
        this.array = [];
        this.index = 0;
        this.start = 0;
        this.end = 0;

        for (let i = 0; i < size; ++i) {
            this.array.push(null);
        }
    }

    head() {
        let i = this.index - 1;
        i += this.size;
        i %= this.size;
        
        return this.array[i];
    }

    push(value) {
        this.array[this.index] = value;

        ++this.index;
        this.index %= this.size;
        this.end = this.index;
    }

    pop() {
        if (this.isEmpty()) return null;

        const value = this.array[this.index];

        --this.index;
        this.index += this.size
        this.index %= this.size;

        return value;
    }

    unpop() {
        if (this.index === this.end) return null;

        const value = this.array[this.index];

        ++this.index;
        this.index %= this.size;
    }

    isEmpty() {
        return this.index === this.start;
    }
}
