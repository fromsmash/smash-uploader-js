import { ConnectionEvents } from '../globals/constant';
import { ConnectionEvent } from './ConnectionEvent';

export class ConnectionProgressEvent implements ConnectionEvent {
    public readonly name = ConnectionEvents.ConnectionProgress;
    readonly connectionId: string;
    constructor(connectionId: string) {
        this.connectionId = connectionId;
    }
}
