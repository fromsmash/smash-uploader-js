import { CustomEvent } from '../core/CustomEventEmitter';
import { TransferBaseEventData } from '../interface/Transfer';

export interface QueueFinishedInput {
    transfer: TransferBaseEventData;
}

export class QueueFinished implements CustomEvent {
    public name = 'queueFinished';
    public transfer: TransferBaseEventData;

    constructor({ transfer }: QueueFinishedInput) {
        this.transfer = { ...transfer };
    }

    get data() {
        return {
            transfer: this.transfer,
        }
    }
}
