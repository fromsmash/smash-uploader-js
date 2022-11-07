export class Queue<T> {
    private readonly queue: Array<T> = [];
    public add(task: T): Queue<T> {
        this.queue.push(task);
        return this;
    }

    public hasOne(): boolean {
        return Boolean(this.queue.length);
    }

    public get length(): number {
        return this.queue.length;
    }

    public shift(): T | null {
        if (this.hasOne()) {
            const task = this.queue.shift();
            if (task) {
                return task;
            }
        }
        return null;
    }
}
