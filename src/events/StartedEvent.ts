import { CustomEvent } from '../core/CustomEventEmitter';
import { TransferBaseEventData } from '../interface/Transfer';

export interface StartedEventInput {
    transfer: TransferBaseEventData;
    startedDate: string;
}

export class StartedEvent implements CustomEvent {
    public name = 'started';
    public transfer: TransferBaseEventData;
    public startedDate: string;

    constructor({ transfer, startedDate }: StartedEventInput) {
        this.transfer = { ...transfer };
        this.startedDate = startedDate;
    }

    get data() {
        return {
            transfer: this.transfer,
            startedDate: this.startedDate,
        }
    }
}
