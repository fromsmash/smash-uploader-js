import { CustomEvent } from '../core/CustomEventEmitter';
import { Transfer } from '../core/Transfer';
import { TransferBaseEventData } from '../interface/Transfer';

export interface FinishingEventInput {
    transfer: TransferBaseEventData;
    finishingDate: string;
}

export class FinishingEvent implements CustomEvent {
    public name = 'finishing';
    public transfer: TransferBaseEventData;
    public finishingDate: string;

    constructor({ transfer, finishingDate }: FinishingEventInput) {
        this.transfer = { ...transfer };
        this.finishingDate = finishingDate;
    }

    get data() {
        return {
            transfer: this.transfer,
            finishingDate: this.finishingDate,
        }
    }
}
