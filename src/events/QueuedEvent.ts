import { CustomEvent } from '../core/CustomEventEmitter';
import { TransferBaseEventData } from '../interface/Transfer';

export interface QueuedEventInput {
    transfer: TransferBaseEventData;
}

export class QueuedEvent implements CustomEvent {
    public name = 'queued';
    public transfer: TransferBaseEventData;

    constructor({ transfer }: QueuedEventInput) {
        this.transfer = { ...transfer };
    }

    get data() {
        return {
            transfer: this.transfer,
        }
    }
}
