import { CustomEvent } from '../core/CustomEventEmitter';
import { TransferBaseEventData } from '../interface/Transfer';

export interface PausedEventInput {
    transfer: TransferBaseEventData;
}

export class PausedEvent implements CustomEvent {
    public name = 'paused';
    public transfer: TransferBaseEventData;

    constructor({ transfer }: PausedEventInput) {
        this.transfer = { ...transfer };
    }

    get data() {
        return {
            transfer: this.transfer,
        }
    }
}
