import { CustomEvent } from '../core/CustomEventEmitter';
import { TransferBaseEventData } from '../interface/Transfer';

export interface FinishedEventInput {
    transfer: TransferBaseEventData & {
        availabilityEndDate: string,
        availabilityStartDate: string,
    };
    finishedDate: string;
    startedDate: string;
}

export class FinishedEvent implements CustomEvent {
    public name = 'finished';
    public transfer: TransferBaseEventData;
    public duration: number;
    public startedDate: string;
    public finishedDate: string;

    constructor({ transfer, startedDate, finishedDate }: FinishedEventInput) {
        this.transfer = { ...transfer };
        this.startedDate = startedDate;
        this.finishedDate = finishedDate;
        this.duration = new Date(this.finishedDate).getTime() - new Date(this.startedDate).getTime();
    }

    get data() {
        return {
            transfer: this.transfer,
            finishedDate: this.finishedDate,
            duration: new Date(this.finishedDate).getTime() - new Date(this.startedDate).getTime(),
        }
    }
}
