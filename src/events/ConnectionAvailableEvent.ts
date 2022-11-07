import { CustomEvent } from '../core/CustomEventEmitter';
import { ConnectionEvents } from '../globals/constant';
import { ConnectionEvent } from './ConnectionEvent';

export class ConnectionAvailableEvent implements ConnectionEvent, CustomEvent {
    public readonly name = ConnectionEvents.ConnectionAvailable;
    readonly connectionId: string;
    constructor(connectionId: string) {
        this.connectionId = connectionId;
    }
}
