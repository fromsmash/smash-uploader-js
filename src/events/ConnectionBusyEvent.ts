import { ConnectionEvents } from '../globals/constant';
import { Task } from '../modules/tasks/Task';
import { ConnectionEvent } from './ConnectionEvent';

export class ConnectionBusyEvent implements ConnectionEvent {
    public readonly name = ConnectionEvents.ConnectionBusy;
    private task?: Task | undefined;
    readonly connectionId: string;

    constructor(connectionId: string, task?: Task) {
        this.connectionId = connectionId;
        this.task = task;
    }


    public hasTask(): boolean {
        return Boolean(this.task);
    }

    public getTask(): Task | undefined {
        return this.task;
    }
}
