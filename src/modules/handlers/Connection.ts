import { CustomEventEmitter } from '../../core/CustomEventEmitter';
import { TaskError } from '../../errors/TaskError';
import { ConnectionAvailableEvent } from '../../events/ConnectionAvailableEvent';
import { ConnectionBusyEvent } from '../../events/ConnectionBusyEvent';
import { ConnectionProgressEvent } from '../../events/ConnectionProgressEvent';
import { Task } from '../tasks/Task';

export class Connection extends CustomEventEmitter {
    private task: Task | null = null;
    public readonly name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    public isBusy(): boolean {
        return Boolean(this.task);
    }

    public isAvailable(): boolean {
        return !Boolean(this.task)
    }

    public wakeUp(): Connection {
        this.available();
        return this;
    }

    public available(): Connection {
        this.dispatch(new ConnectionAvailableEvent(this.name));
        return this;
    }

    public ping(): Connection {
        if (this.isAvailable()) {
            this.available();
        } else {
            this.busy();
        }
        return this;
    }

    private busy(task?: Task): Connection {
        this.dispatch(new ConnectionBusyEvent(this.name, task));
        return this;
    }

    public progress(loaded: string, part: any): void {
        this.dispatch(new ConnectionProgressEvent(this.name));
        /* this.emit('onmessage', {
            name: this.name,
            busy: this.promise.isPending(),
            task: 'uploadingPart', //FIX ME TASKS.UPLOAD_PART
            type: 'uploadProgress', //FIX ME TYPE.EVENT
            part,
            loaded,
    });*/
    }

    private startTask(task: Task): Connection {
        this.task = task;
        return this;
    }

    getTask(): Task | null {
        return this.task;
    }

    private endTask(): Connection {
        this.task = null;
        return this;
    }

    public execute(task: Task): Promise<Task> {
        this.startTask(task);
        return new Promise(resolve => {
            try {
                setTimeout(async () => {
                    const processedTask = await task.execute();
                    resolve(processedTask);
                    this.endTask();
                }, task.delay);
            } catch (error) {
                task.error = new TaskError(task, error);
                resolve(task);
                this.endTask();
            }
        });
    }

    public reset() {
        // TODO
    }
}
